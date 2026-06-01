from typing import Any

import pandas as pd

from app.data_engineering.clients.openf1 import OpenF1Client
from app.data_engineering.config import ETLConfig
from app.data_engineering.records import SessionExtract


class OpenF1Extractor:
    def __init__(self, client: OpenF1Client, config: ETLConfig) -> None:
        self.client = client
        self.config = config

    async def iter_session_refs(self) -> list[dict[str, Any]]:
        refs: list[dict[str, Any]] = []
        start_year = max(self.config.start_year, self.config.openf1_min_year)
        for year in range(start_year, self.config.end_year + 1):
            sessions = await self.client.get("sessions", {"year": year})
            for session in sessions:
                if self._is_requested_session(session):
                    refs.append(session)
        return refs

    async def extract(self, session_ref: dict[str, Any]) -> SessionExtract:
        session_key = int(session_ref["session_key"])
        meeting_key = int(session_ref["meeting_key"])
        season = int(session_ref["year"])

        drivers = pd.DataFrame(await self.client.get("drivers", {"session_key": session_key}))
        laps = pd.DataFrame(await self.client.get("laps", {"session_key": session_key}))
        weather = pd.DataFrame(await self.client.get("weather", {"session_key": session_key}))
        stints = pd.DataFrame(await self.client.get("stints", {"session_key": session_key}))
        pit = pd.DataFrame(await self.client.get("pit", {"session_key": session_key}))
        positions = pd.DataFrame(await self.client.get("position", {"session_key": session_key}))

        telemetry = pd.DataFrame()
        if self.config.telemetry_enabled and not drivers.empty:
            telemetry = await self._telemetry(session_key, drivers)

        teams = self._teams(drivers)
        normalized_drivers = self._drivers(drivers)
        normalized_laps = self._laps(laps, drivers)
        normalized_weather = self._weather(weather)
        normalized_stints = self._stints(stints, drivers)
        normalized_pit = self._pit_stops(pit)
        normalized_positions = self._positions(positions)

        circuit = {
            "circuit_key": session_ref.get("circuit_key"),
            "name": session_ref.get("circuit_short_name")
            or session_ref.get("location")
            or "Unknown Circuit",
            "country": session_ref.get("country_name") or "Unknown",
            "locality": session_ref.get("location"),
            "latitude": session_ref.get("circuit_latitude"),
            "longitude": session_ref.get("circuit_longitude"),
        }
        session_record = {
            "session_key": session_key,
            "season": season,
            "round_number": None,
            "name": session_ref.get("session_name") or session_ref.get("session_type"),
            "type": self._session_type(
                session_ref.get("session_type"), session_ref.get("session_name")
            ),
            "status": "completed",
            "starts_at": self._timestamp(session_ref.get("date_start")),
            "ends_at": self._timestamp(session_ref.get("date_end")),
            "total_laps": int(normalized_laps["lap_number"].max())
            if not normalized_laps.empty
            else None,
            "weather_source": "openf1",
        }

        return SessionExtract(
            source="openf1",
            season=season,
            session_name=str(session_record["name"]),
            session_key=session_key,
            meeting_key=meeting_key,
            circuit=circuit,
            session=session_record,
            teams=teams,
            drivers=normalized_drivers,
            laps=normalized_laps,
            telemetry=telemetry,
            weather=normalized_weather,
            stints=normalized_stints,
            pit_stops=normalized_pit,
            positions=normalized_positions,
            metadata={"meeting_key": meeting_key},
        )

    async def _telemetry(self, session_key: int, drivers: pd.DataFrame) -> pd.DataFrame:
        frames: list[pd.DataFrame] = []
        for driver_number in drivers["driver_number"].dropna().astype(int).unique():
            car_data = pd.DataFrame(
                await self.client.get(
                    "car_data",
                    {"session_key": session_key, "driver_number": int(driver_number)},
                )
            )
            location = pd.DataFrame(
                await self.client.get(
                    "location",
                    {"session_key": session_key, "driver_number": int(driver_number)},
                )
            )
            if car_data.empty and location.empty:
                continue
            frame = self._merge_car_and_location(car_data, location)
            frame["session_key"] = session_key
            frame["driver_number"] = int(driver_number)
            frame["source_sample_id"] = (
                "openf1:"
                + frame["driver_number"].astype(str)
                + ":"
                + frame["sample_time"].astype(str)
            )
            frames.append(frame)
        if not frames:
            return pd.DataFrame()
        telemetry = pd.concat(frames, ignore_index=True)
        if self.config.telemetry_sample_limit:
            telemetry = telemetry.head(self.config.telemetry_sample_limit)
        return telemetry

    @staticmethod
    def _merge_car_and_location(car_data: pd.DataFrame, location: pd.DataFrame) -> pd.DataFrame:
        if not car_data.empty:
            car = car_data.rename(
                columns={
                    "date": "sample_time",
                    "speed": "speed_kph",
                    "throttle": "throttle_pct",
                    "brake": "brake_pct",
                    "n_gear": "gear",
                }
            )
            car["sample_time"] = pd.to_datetime(car["sample_time"], utc=True)
        else:
            car = pd.DataFrame(columns=["sample_time"])
        if not location.empty:
            loc = location.rename(columns={"date": "sample_time"})
            loc["sample_time"] = pd.to_datetime(loc["sample_time"], utc=True)
        else:
            loc = pd.DataFrame(columns=["sample_time"])
        if car.empty:
            merged = loc
        elif loc.empty:
            merged = car
        else:
            merged = pd.merge_asof(
                car.sort_values("sample_time"),
                loc[["sample_time", "x", "y", "z"]].sort_values("sample_time"),
                on="sample_time",
                tolerance=pd.Timedelta(seconds=1),
                direction="nearest",
            )
        columns = [
            "sample_time",
            "speed_kph",
            "throttle_pct",
            "brake_pct",
            "gear",
            "rpm",
            "drs",
            "x",
            "y",
            "z",
        ]
        for column in columns:
            if column not in merged.columns:
                merged[column] = None
        return merged[columns]

    @staticmethod
    def _is_requested_session(session: dict[str, Any]) -> bool:
        session_name = str(session.get("session_name") or "").lower()
        session_type = str(session.get("session_type") or "").lower()
        return any(
            token in f"{session_name} {session_type}"
            for token in ("practice", "qualifying", "sprint", "race")
        )

    @staticmethod
    def _session_type(session_type: Any, session_name: Any) -> str:
        text = f"{session_type or ''} {session_name or ''}".lower()
        if "practice" in text:
            return "practice"
        if "qualifying" in text:
            return "qualifying"
        if "sprint" in text:
            return "sprint"
        return "race"

    @staticmethod
    def _teams(drivers: pd.DataFrame) -> pd.DataFrame:
        if drivers.empty or "team_name" not in drivers.columns:
            return pd.DataFrame()
        teams = drivers[["team_name", "team_colour"]].dropna(subset=["team_name"]).drop_duplicates()
        return pd.DataFrame(
            {
                "constructor_id": teams["team_name"]
                .str.lower()
                .str.replace(r"[^a-z0-9]+", "_", regex=True),
                "name": teams["team_name"],
                "nationality": None,
                "base_country": None,
                "color_hex": "#"
                + teams["team_colour"].fillna("").astype(str).str.strip("#").str.slice(0, 6),
            }
        )

    @staticmethod
    def _drivers(drivers: pd.DataFrame) -> pd.DataFrame:
        if drivers.empty:
            return pd.DataFrame()
        frame = pd.DataFrame(
            {
                "driver_number": drivers["driver_number"].astype(int),
                "code": drivers["name_acronym"]
                .fillna("")
                .astype(str)
                .str.slice(0, 3)
                .str.upper()
                .str.pad(3, fillchar="X"),
                "full_name": drivers["full_name"].fillna(drivers.get("broadcast_name", "")),
                "country_code": drivers.get("country_code"),
                "team_name": drivers.get("team_name"),
            }
        )
        return frame.drop_duplicates(subset=["driver_number"])

    @staticmethod
    def _laps(laps: pd.DataFrame, drivers: pd.DataFrame) -> pd.DataFrame:
        if laps.empty:
            return pd.DataFrame()
        driver_team = (
            drivers[["driver_number", "team_name"]].drop_duplicates()
            if "team_name" in drivers
            else pd.DataFrame()
        )
        frame = laps.rename(
            columns={
                "duration_sector_1": "sector_1_s",
                "duration_sector_2": "sector_2_s",
                "duration_sector_3": "sector_3_s",
                "lap_duration": "lap_time_s",
            }
        ).copy()
        if not driver_team.empty:
            frame = frame.merge(driver_team, on="driver_number", how="left")
        frame["compound"] = "unknown"
        frame["tyre_age_laps"] = 0
        pit_out = (
            frame["is_pit_out_lap"]
            if "is_pit_out_lap" in frame.columns
            else pd.Series(False, index=frame.index)
        )
        return pd.DataFrame(
            {
                "session_key": frame["session_key"].astype(int),
                "driver_number": frame["driver_number"].astype(int),
                "team_name": frame.get("team_name"),
                "lap_number": frame["lap_number"].astype(int),
                "position": frame.get("position"),
                "lap_time_ms": (frame["lap_time_s"] * 1000).round().astype("Int64"),
                "sector_1_ms": (frame["sector_1_s"] * 1000).round().astype("Int64"),
                "sector_2_ms": (frame["sector_2_s"] * 1000).round().astype("Int64"),
                "sector_3_ms": (frame["sector_3_s"] * 1000).round().astype("Int64"),
                "compound": frame["compound"],
                "tyre_age_laps": frame["tyre_age_laps"],
                "stint_number": None,
                "is_pit_in_lap": pit_out.fillna(False),
                "is_pit_out_lap": pit_out.fillna(False),
                "track_status": None,
            }
        )

    @staticmethod
    def _weather(weather: pd.DataFrame) -> pd.DataFrame:
        if weather.empty:
            return pd.DataFrame()
        return pd.DataFrame(
            {
                "session_key": weather["session_key"].astype(int),
                "recorded_at": pd.to_datetime(weather["date"], utc=True),
                "air_temp_c": weather.get("air_temperature"),
                "track_temp_c": weather.get("track_temperature"),
                "humidity_pct": weather.get("humidity"),
                "pressure_hpa": weather.get("pressure"),
                "wind_speed_mps": weather.get("wind_speed"),
                "wind_direction_deg": weather.get("wind_direction"),
                "rainfall_mm": weather.get("rainfall"),
                "is_raining": weather.get("rainfall", 0).fillna(0).astype(float) > 0,
            }
        )

    @staticmethod
    def _stints(stints: pd.DataFrame, drivers: pd.DataFrame) -> pd.DataFrame:
        if stints.empty:
            return pd.DataFrame()
        driver_team = (
            drivers[["driver_number", "team_name"]].drop_duplicates()
            if "team_name" in drivers
            else pd.DataFrame()
        )
        frame = stints.copy()
        if not driver_team.empty:
            frame = frame.merge(driver_team, on="driver_number", how="left")
        return pd.DataFrame(
            {
                "session_key": frame["session_key"].astype(int),
                "driver_number": frame["driver_number"].astype(int),
                "team_name": frame.get("team_name"),
                "stint_number": frame["stint_number"].astype(int),
                "compound": frame["compound"].fillna("unknown").astype(str).str.lower(),
                "start_lap": frame["lap_start"].astype(int),
                "end_lap": frame["lap_end"].astype("Int64"),
                "start_tyre_age_laps": frame.get("tyre_age_at_start", 0).fillna(0).astype(int),
                "laps_completed": frame["lap_end"].fillna(frame["lap_start"]).astype(int)
                - frame["lap_start"].astype(int)
                + 1,
                "degradation_slope_ms_per_lap": None,
            }
        )

    @staticmethod
    def _pit_stops(pit: pd.DataFrame) -> pd.DataFrame:
        if pit.empty:
            return pd.DataFrame()
        stop_duration = (
            pit["stop_duration"]
            if "stop_duration" in pit.columns
            else pd.Series(pd.NA, index=pit.index)
        )
        pit_duration = (
            pit["pit_duration"]
            if "pit_duration" in pit.columns
            else pd.Series(pd.NA, index=pit.index)
        )
        return pd.DataFrame(
            {
                "session_key": pit["session_key"].astype(int),
                "driver_number": pit["driver_number"].astype(int),
                "lap_number": pit["lap_number"].astype(int),
                "stop_number": pit.groupby(["session_key", "driver_number"]).cumcount() + 1,
                "stationary_ms": (stop_duration * 1000).round().astype("Int64"),
                "total_pit_lane_ms": (pit_duration * 1000).round().astype("Int64"),
                "compound_from": None,
                "compound_to": None,
            }
        )

    @staticmethod
    def _positions(positions: pd.DataFrame) -> pd.DataFrame:
        if positions.empty:
            return pd.DataFrame()
        return pd.DataFrame(
            {
                "session_key": positions["session_key"].astype(int),
                "driver_number": positions["driver_number"].astype(int),
                "recorded_at": pd.to_datetime(positions["date"], utc=True),
                "position": positions["position"].astype(int),
                "source": "openf1",
            }
        )

    @staticmethod
    def _timestamp(value: Any) -> pd.Timestamp | None:
        if value is None or pd.isna(value):
            return None
        return (
            pd.Timestamp(value).tz_convert("UTC")
            if pd.Timestamp(value).tzinfo
            else pd.Timestamp(value).tz_localize("UTC")
        )
