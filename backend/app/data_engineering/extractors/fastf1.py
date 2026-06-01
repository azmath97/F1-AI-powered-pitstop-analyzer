from typing import Any

import numpy as np
import pandas as pd

from app.data_engineering.clients.fastf1 import FastF1Client
from app.data_engineering.config import ETLConfig
from app.data_engineering.records import SessionExtract
from app.data_engineering.time import milliseconds, timedelta_to_timestamp, to_utc_timestamp


class FastF1Extractor:
    def __init__(self, client: FastF1Client, config: ETLConfig) -> None:
        self.client = client
        self.config = config

    def iter_session_refs(self) -> list[tuple[int, int, str]]:
        refs: list[tuple[int, int, str]] = []
        for year in range(self.config.start_year, self.config.end_year + 1):
            schedule = self.client.event_schedule(year)
            if schedule.empty:
                continue
            for _, event in schedule.iterrows():
                round_number = int(event["RoundNumber"])
                for session_code in self.config.session_codes:
                    if self._event_has_session(event, session_code):
                        refs.append((year, round_number, session_code))
        return refs

    def extract(self, year: int, round_number: int, session_code: str) -> SessionExtract:
        session = self.client.load_session(
            year,
            round_number,
            session_code,
            telemetry=self.config.telemetry_enabled,
        )
        session_key = self._stable_session_key(year, round_number, session_code)
        t0_date = to_utc_timestamp(getattr(session, "t0_date", None))
        event = getattr(session, "event", {})

        laps = self._laps(session, session_key)
        drivers = self._drivers(session, laps)
        teams = self._teams(drivers)
        telemetry = (
            self._telemetry(session, t0_date, session_key)
            if self.config.telemetry_enabled
            else pd.DataFrame()
        )
        weather = self._weather(session, t0_date, session_key)
        stints = self._stints(laps, session_key)
        pit_stops = self._pit_stops(laps, session_key)

        circuit = {
            "circuit_key": None,
            "name": str(event.get("Location") or event.get("EventName") or "Unknown Circuit"),
            "country": str(event.get("Country") or "Unknown"),
            "locality": event.get("Location"),
        }
        session_record = {
            "session_key": session_key,
            "season": year,
            "round_number": round_number,
            "name": str(getattr(session, "name", session_code)),
            "type": self._session_type(session_code),
            "status": "completed",
            "starts_at": to_utc_timestamp(getattr(session, "date", None)),
            "total_laps": self._total_laps(laps),
            "weather_source": "fastf1",
        }
        return SessionExtract(
            source="fastf1",
            season=year,
            session_name=str(getattr(session, "name", session_code)),
            session_key=session_key,
            meeting_key=None,
            circuit=circuit,
            session=session_record,
            teams=teams,
            drivers=drivers,
            laps=laps,
            telemetry=telemetry,
            weather=weather,
            stints=stints,
            pit_stops=pit_stops,
            metadata={"round_number": round_number, "session_code": session_code},
        )

    @staticmethod
    def _event_has_session(event: pd.Series, session_code: str) -> bool:
        session_names = [str(event.get(f"Session{i}", "")) for i in range(1, 6)]
        aliases = {
            "FP1": ("Practice 1", "FP1"),
            "FP2": ("Practice 2", "FP2"),
            "FP3": ("Practice 3", "FP3"),
            "Q": ("Qualifying",),
            "SQ": ("Sprint Qualifying", "Sprint Shootout"),
            "S": ("Sprint",),
            "R": ("Race",),
        }
        return any(name in session_names for name in aliases.get(session_code, (session_code,)))

    @staticmethod
    def _stable_session_key(year: int, round_number: int, session_code: str) -> int:
        code_number = {"FP1": 1, "FP2": 2, "FP3": 3, "Q": 4, "SQ": 5, "S": 6, "R": 7}.get(
            session_code, 9
        )
        return year * 100000 + round_number * 100 + code_number

    @staticmethod
    def _session_type(session_code: str) -> str:
        if session_code.startswith("FP"):
            return "practice"
        if session_code in {"Q", "SQ"}:
            return "qualifying"
        if session_code == "S":
            return "sprint"
        return "race"

    @staticmethod
    def _total_laps(laps: pd.DataFrame) -> int | None:
        if laps.empty or "lap_number" not in laps.columns:
            return None
        return int(laps["lap_number"].max())

    def _laps(self, session: Any, session_key: int) -> pd.DataFrame:
        source = getattr(session, "laps", pd.DataFrame()).copy()
        if source.empty:
            return pd.DataFrame()
        rows: list[dict[str, Any]] = []
        for _, row in source.iterrows():
            rows.append(
                {
                    "session_key": session_key,
                    "driver_number": self._nullable_int(row.get("DriverNumber")),
                    "driver_code": row.get("Driver"),
                    "team_name": row.get("Team"),
                    "lap_number": self._nullable_int(row.get("LapNumber")),
                    "position": self._nullable_int(row.get("Position")),
                    "lap_time_ms": milliseconds(row.get("LapTime")),
                    "sector_1_ms": milliseconds(row.get("Sector1Time")),
                    "sector_2_ms": milliseconds(row.get("Sector2Time")),
                    "sector_3_ms": milliseconds(row.get("Sector3Time")),
                    "compound": self._compound(row.get("Compound")),
                    "tyre_age_laps": self._nullable_int(row.get("TyreLife")) or 0,
                    "stint_number": self._nullable_int(row.get("Stint")),
                    "is_pit_in_lap": pd.notna(row.get("PitInTime")),
                    "is_pit_out_lap": pd.notna(row.get("PitOutTime")),
                    "track_status": None
                    if pd.isna(row.get("TrackStatus"))
                    else str(row.get("TrackStatus")),
                    "lap_start_time": row.get("LapStartTime"),
                }
            )
        return pd.DataFrame(rows).dropna(subset=["driver_number", "lap_number"])

    def _drivers(self, session: Any, laps: pd.DataFrame) -> pd.DataFrame:
        if laps.empty:
            return pd.DataFrame()
        rows: list[dict[str, Any]] = []
        for driver_number, group in laps.groupby("driver_number"):
            driver_code = (
                str(group["driver_code"].dropna().iloc[0])
                if group["driver_code"].notna().any()
                else str(driver_number)
            )
            full_name = driver_code
            try:
                result = session.get_driver(driver_code)
                full_name = str(
                    result.get("FullName") or result.get("BroadcastName") or driver_code
                )
            except Exception:
                pass
            rows.append(
                {
                    "driver_number": int(driver_number),
                    "code": driver_code[:3].upper().ljust(3, "X"),
                    "full_name": full_name,
                    "country_code": None,
                    "team_name": group["team_name"].dropna().iloc[0]
                    if group["team_name"].notna().any()
                    else None,
                }
            )
        return pd.DataFrame(rows)

    @staticmethod
    def _teams(drivers: pd.DataFrame) -> pd.DataFrame:
        if drivers.empty or "team_name" not in drivers.columns:
            return pd.DataFrame()
        teams = drivers[["team_name"]].dropna().drop_duplicates()
        return pd.DataFrame(
            {
                "constructor_id": teams["team_name"]
                .str.lower()
                .str.replace(r"[^a-z0-9]+", "_", regex=True),
                "name": teams["team_name"],
                "nationality": None,
                "base_country": None,
                "color_hex": None,
            }
        )

    def _telemetry(
        self, session: Any, t0_date: pd.Timestamp | None, session_key: int
    ) -> pd.DataFrame:
        rows: list[pd.DataFrame] = []
        car_data = getattr(session, "car_data", {}) or {}
        pos_data = getattr(session, "pos_data", {}) or {}
        for driver_number, car_frame in car_data.items():
            car = car_frame.copy()
            if car.empty or "Date" not in car.columns:
                continue
            car = car.rename(
                columns={
                    "Date": "sample_time",
                    "Speed": "speed_kph",
                    "RPM": "rpm",
                    "nGear": "gear",
                    "Throttle": "throttle_pct",
                    "Brake": "brake_pct",
                    "DRS": "drs",
                }
            )
            car["sample_time"] = pd.to_datetime(car["sample_time"], utc=True)
            car["driver_number"] = int(driver_number)
            pos = pos_data.get(str(driver_number))
            if pos is not None and not pos.empty and "Date" in pos.columns:
                pos = pos.rename(columns={"Date": "sample_time", "X": "x", "Y": "y", "Z": "z"})
                pos["sample_time"] = pd.to_datetime(pos["sample_time"], utc=True)
                car = pd.merge_asof(
                    car.sort_values("sample_time"),
                    pos[["sample_time", "x", "y", "z"]].sort_values("sample_time"),
                    on="sample_time",
                    tolerance=pd.Timedelta(seconds=1),
                    direction="nearest",
                )
            car["session_key"] = session_key
            car["source_sample_id"] = (
                "fastf1:" + car["driver_number"].astype(str) + ":" + car["sample_time"].astype(str)
            )
            rows.append(car)
        if not rows:
            return pd.DataFrame()
        telemetry = pd.concat(rows, ignore_index=True)
        if self.config.telemetry_sample_limit:
            telemetry = telemetry.head(self.config.telemetry_sample_limit)
        columns = [
            "session_key",
            "driver_number",
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
            "source_sample_id",
        ]
        for column in columns:
            if column not in telemetry.columns:
                telemetry[column] = None
        return telemetry[columns]

    def _weather(
        self, session: Any, t0_date: pd.Timestamp | None, session_key: int
    ) -> pd.DataFrame:
        source = getattr(session, "weather_data", pd.DataFrame()).copy()
        if source.empty:
            return pd.DataFrame()
        rows = []
        for _, row in source.iterrows():
            recorded_at = timedelta_to_timestamp(t0_date, row.get("Time"))
            rows.append(
                {
                    "session_key": session_key,
                    "recorded_at": recorded_at,
                    "air_temp_c": row.get("AirTemp"),
                    "track_temp_c": row.get("TrackTemp"),
                    "humidity_pct": row.get("Humidity"),
                    "pressure_hpa": row.get("Pressure"),
                    "wind_speed_mps": row.get("WindSpeed"),
                    "wind_direction_deg": self._nullable_int(row.get("WindDirection")),
                    "rainfall_mm": 1 if bool(row.get("Rainfall")) else 0,
                    "is_raining": bool(row.get("Rainfall")),
                }
            )
        return pd.DataFrame(rows).dropna(subset=["recorded_at"])

    def _stints(self, laps: pd.DataFrame, session_key: int) -> pd.DataFrame:
        if laps.empty:
            return pd.DataFrame()
        rows = []
        for (driver_number, stint_number), group in laps.dropna(subset=["stint_number"]).groupby(
            ["driver_number", "stint_number"]
        ):
            rows.append(
                {
                    "session_key": session_key,
                    "driver_number": int(driver_number),
                    "team_name": group["team_name"].dropna().iloc[0]
                    if group["team_name"].notna().any()
                    else None,
                    "stint_number": int(stint_number),
                    "compound": self._compound(group["compound"].dropna().iloc[0]),
                    "start_lap": int(group["lap_number"].min()),
                    "end_lap": int(group["lap_number"].max()),
                    "start_tyre_age_laps": int(group["tyre_age_laps"].min()),
                    "laps_completed": int(group["lap_number"].count()),
                    "degradation_slope_ms_per_lap": self._degradation_slope(group),
                }
            )
        return pd.DataFrame(rows)

    def _pit_stops(self, laps: pd.DataFrame, session_key: int) -> pd.DataFrame:
        if laps.empty:
            return pd.DataFrame()
        rows = []
        pit_laps = laps[laps["is_pit_in_lap"] | laps["is_pit_out_lap"]].copy()
        for driver_number, group in pit_laps.groupby("driver_number"):
            for stop_number, (_, row) in enumerate(
                group.sort_values("lap_number").iterrows(), start=1
            ):
                rows.append(
                    {
                        "session_key": session_key,
                        "driver_number": int(driver_number),
                        "lap_number": int(row["lap_number"]),
                        "stop_number": stop_number,
                        "stationary_ms": None,
                        "total_pit_lane_ms": None,
                        "compound_from": self._compound(row.get("compound")),
                        "compound_to": None,
                    }
                )
        return pd.DataFrame(rows)

    @staticmethod
    def _compound(value: Any) -> str:
        if value is None or pd.isna(value):
            return "unknown"
        normalized = str(value).lower()
        return (
            normalized
            if normalized in {"soft", "medium", "hard", "intermediate", "wet"}
            else "unknown"
        )

    @staticmethod
    def _nullable_int(value: Any) -> int | None:
        if value is None or pd.isna(value):
            return None
        return int(value)

    @staticmethod
    def _degradation_slope(group: pd.DataFrame) -> float | None:
        clean = group.dropna(subset=["lap_number", "lap_time_ms"])
        if len(clean) < 3:
            return None
        return float(
            np.polyfit(clean["lap_number"].astype(float), clean["lap_time_ms"].astype(float), 1)[0]
        )
