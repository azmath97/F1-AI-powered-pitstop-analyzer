from typing import Any
from uuid import UUID

import asyncpg

from app.data_engineering.database import clean_value, records
from app.data_engineering.records import SessionExtract
from app.data_engineering.time import utc_now


class PostgresETLRepository:
    def __init__(self, connection: asyncpg.Connection, batch_size: int = 1000) -> None:
        self.connection = connection
        self.batch_size = batch_size

    async def start_ingestion_run(self, extract: SessionExtract) -> UUID:
        row = await self.connection.fetchrow(
            """
            insert into public.ingestion_runs (
              source, season, session_key, session_name, status, metadata
            )
            values ($1, $2, $3, $4, 'started', $5::jsonb)
            returning id
            """,
            extract.source,
            extract.season,
            extract.session_key,
            extract.session_name,
            self._json(extract.metadata),
        )
        return row["id"]

    async def finish_ingestion_run(
        self,
        run_id: UUID,
        status: str,
        records_extracted: int,
        records_loaded: int,
        error_message: str | None = None,
    ) -> None:
        await self.connection.execute(
            """
            update public.ingestion_runs
            set status = $2,
                finished_at = $3,
                records_extracted = $4,
                records_loaded = $5,
                error_message = $6
            where id = $1
            """,
            run_id,
            status,
            utc_now(),
            records_extracted,
            records_loaded,
            error_message,
        )

    async def load(self, extract: SessionExtract) -> int:
        async with self.connection.transaction():
            circuit_id = await self._upsert_circuit(extract.circuit)
            session_id = await self._upsert_session(extract.session, circuit_id)
            team_ids = await self._upsert_teams(extract)
            driver_ids = await self._upsert_drivers(extract, team_ids)
            loaded = 0
            loaded += await self._load_laps(extract, session_id, team_ids, driver_ids)
            loaded += await self._load_telemetry(extract, session_id, driver_ids)
            loaded += await self._load_weather(extract, session_id)
            loaded += await self._load_stints(extract, session_id, team_ids, driver_ids)
            loaded += await self._load_pit_stops(extract, session_id, driver_ids)
            loaded += await self._load_positions(extract, session_id, driver_ids)
            return loaded

    async def save_quality_report(
        self,
        ingestion_run_id: UUID | None,
        dataset_name: str,
        status: str,
        total_rows: int,
        failed_checks: int,
        warning_checks: int,
        report: dict[str, Any],
    ) -> None:
        await self.connection.execute(
            """
            insert into public.data_quality_reports (
              ingestion_run_id,
              dataset_name,
              status,
              total_rows,
              failed_checks,
              warning_checks,
              report
            )
            values ($1, $2, $3, $4, $5, $6, $7::jsonb)
            """,
            ingestion_run_id,
            dataset_name,
            status,
            total_rows,
            failed_checks,
            warning_checks,
            self._json(report),
        )

    async def _upsert_circuit(self, circuit: dict[str, Any]) -> UUID:
        circuit_key = clean_value(circuit.get("circuit_key"))
        if circuit_key is not None:
            row = await self.connection.fetchrow(
                """
                insert into public.circuits (
                  circuit_key,
                  name,
                  country,
                  locality,
                  length_m,
                  latitude,
                  longitude,
                  timezone,
                  layout_geojson
                )
                values ($1, $2, $3, $4, $5, $6, $7, $8, '{}'::jsonb)
                on conflict (circuit_key) do update
                set name = excluded.name,
                    country = excluded.country,
                    locality = excluded.locality,
                    latitude = excluded.latitude,
                    longitude = excluded.longitude,
                    updated_at = now()
                returning id
                """,
                circuit_key,
                circuit.get("name"),
                circuit.get("country"),
                circuit.get("locality"),
                clean_value(circuit.get("length_m")),
                clean_value(circuit.get("latitude")),
                clean_value(circuit.get("longitude")),
                circuit.get("timezone"),
            )
            return row["id"]

        existing = await self.connection.fetchrow(
            "select id from public.circuits where name = $1 and country = $2 limit 1",
            circuit.get("name"),
            circuit.get("country"),
        )
        if existing:
            return existing["id"]
        row = await self.connection.fetchrow(
            """
            insert into public.circuits (name, country, locality, layout_geojson)
            values ($1, $2, $3, '{}'::jsonb)
            returning id
            """,
            circuit.get("name"),
            circuit.get("country"),
            circuit.get("locality"),
        )
        return row["id"]

    async def _upsert_session(self, session: dict[str, Any], circuit_id: UUID) -> UUID:
        row = await self.connection.fetchrow(
            """
            insert into public.sessions (
              session_key, circuit_id, season, round_number, name, type, status,
              starts_at, ends_at, total_laps, pit_lane_loss_ms, weather_source
            )
            values ($1, $2, $3, $4, $5, $6::public.session_type, $7::public.session_status,
                    $8, $9, $10, $11, $12)
            on conflict (session_key) do update
            set circuit_id = excluded.circuit_id,
                status = excluded.status,
                total_laps = excluded.total_laps,
                weather_source = excluded.weather_source,
                updated_at = now()
            returning id
            """,
            session.get("session_key"),
            circuit_id,
            session.get("season"),
            clean_value(session.get("round_number")),
            session.get("name"),
            session.get("type"),
            session.get("status", "completed"),
            clean_value(session.get("starts_at")),
            clean_value(session.get("ends_at")),
            clean_value(session.get("total_laps")),
            clean_value(session.get("pit_lane_loss_ms")),
            session.get("weather_source"),
        )
        return row["id"]

    async def _upsert_teams(self, extract: SessionExtract) -> dict[str, UUID]:
        team_ids: dict[str, UUID] = {}
        for row in records(extract.teams):
            if not row.get("name"):
                continue
            result = await self.connection.fetchrow(
                """
                insert into public.teams (
                  constructor_id,
                  name,
                  nationality,
                  base_country,
                  color_hex
                )
                values ($1, $2, $3, $4, $5)
                on conflict (constructor_id) do update
                set name = excluded.name,
                    color_hex = excluded.color_hex,
                    updated_at = now()
                returning id
                """,
                row.get("constructor_id"),
                row.get("name"),
                row.get("nationality"),
                row.get("base_country"),
                row.get("color_hex") if self._valid_color(row.get("color_hex")) else None,
            )
            team_ids[str(row["name"])] = result["id"]
        return team_ids

    async def _upsert_drivers(
        self, extract: SessionExtract, team_ids: dict[str, UUID]
    ) -> dict[int, UUID]:
        driver_ids: dict[int, UUID] = {}
        for row in records(extract.drivers):
            driver_number = row.get("driver_number")
            if driver_number is None:
                continue
            team_id = team_ids.get(str(row.get("team_name")))
            result = await self.connection.fetchrow(
                """
                insert into public.drivers (
                  driver_number, code, full_name, country_code, current_team_id, is_active
                )
                values ($1, $2, $3, $4, $5, true)
                on conflict (driver_number) do update
                set code = excluded.code,
                    full_name = excluded.full_name,
                    country_code = excluded.country_code,
                    current_team_id = excluded.current_team_id,
                    updated_at = now()
                returning id
                """,
                int(driver_number),
                row.get("code"),
                row.get("full_name"),
                row.get("country_code"),
                team_id,
            )
            driver_ids[int(driver_number)] = result["id"]
        return driver_ids

    async def _load_laps(
        self,
        extract: SessionExtract,
        session_id: UUID,
        team_ids: dict[str, UUID],
        driver_ids: dict[int, UUID],
    ) -> int:
        rows = []
        for row in records(extract.laps):
            driver_id = driver_ids.get(int(row["driver_number"]))
            if not driver_id:
                continue
            rows.append(
                (
                    session_id,
                    driver_id,
                    team_ids.get(str(row.get("team_name"))),
                    int(row["lap_number"]),
                    clean_value(row.get("position")),
                    clean_value(row.get("lap_time_ms")),
                    clean_value(row.get("sector_1_ms")),
                    clean_value(row.get("sector_2_ms")),
                    clean_value(row.get("sector_3_ms")),
                    row.get("compound", "unknown"),
                    int(row.get("tyre_age_laps") or 0),
                    clean_value(row.get("stint_number")),
                    bool(row.get("is_pit_in_lap") or False),
                    bool(row.get("is_pit_out_lap") or False),
                    row.get("track_status"),
                )
            )
        await self._executemany(
            """
            insert into public.laps (
              session_id, driver_id, team_id, lap_number, position, lap_time_ms,
              sector_1_ms, sector_2_ms, sector_3_ms, compound, tyre_age_laps,
              stint_number, is_pit_in_lap, is_pit_out_lap, track_status
            )
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::public.tyre_compound,
                    $11, $12, $13, $14, $15)
            on conflict (session_id, driver_id, lap_number) do update
            set position = excluded.position,
                lap_time_ms = excluded.lap_time_ms,
                sector_1_ms = excluded.sector_1_ms,
                sector_2_ms = excluded.sector_2_ms,
                sector_3_ms = excluded.sector_3_ms,
                compound = excluded.compound,
                tyre_age_laps = excluded.tyre_age_laps,
                stint_number = excluded.stint_number,
                is_pit_in_lap = excluded.is_pit_in_lap,
                is_pit_out_lap = excluded.is_pit_out_lap,
                track_status = excluded.track_status
            """,
            rows,
        )
        return len(rows)

    async def _load_telemetry(
        self, extract: SessionExtract, session_id: UUID, driver_ids: dict[int, UUID]
    ) -> int:
        rows = []
        for row in records(extract.telemetry):
            driver_id = driver_ids.get(int(row["driver_number"]))
            if not driver_id or row.get("sample_time") is None:
                continue
            rows.append(
                (
                    session_id,
                    driver_id,
                    row.get("sample_time"),
                    clean_value(row.get("distance_m")),
                    clean_value(row.get("speed_kph")),
                    clean_value(row.get("throttle_pct")),
                    clean_value(row.get("brake_pct")),
                    clean_value(row.get("gear")),
                    clean_value(row.get("rpm")),
                    clean_value(row.get("drs")),
                    clean_value(row.get("x")),
                    clean_value(row.get("y")),
                    clean_value(row.get("z")),
                    row.get("source_sample_id"),
                )
            )
        await self._executemany(
            """
            insert into public.telemetry (
              session_id, driver_id, sample_time, distance_m, speed_kph, throttle_pct, brake_pct,
              gear, rpm, drs, x, y, z, source_sample_id
            )
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            on conflict do nothing
            """,
            rows,
        )
        return len(rows)

    async def _load_weather(self, extract: SessionExtract, session_id: UUID) -> int:
        rows = [
            (
                session_id,
                row.get("recorded_at"),
                clean_value(row.get("lap_number")),
                clean_value(row.get("air_temp_c")),
                clean_value(row.get("track_temp_c")),
                clean_value(row.get("humidity_pct")),
                clean_value(row.get("pressure_hpa")),
                clean_value(row.get("wind_speed_mps")),
                clean_value(row.get("wind_direction_deg")),
                clean_value(row.get("rainfall_mm")),
                bool(row.get("is_raining") or False),
            )
            for row in records(extract.weather)
            if row.get("recorded_at") is not None
        ]
        await self._executemany(
            """
            insert into public.weather (
              session_id, recorded_at, lap_number, air_temp_c, track_temp_c, humidity_pct,
              pressure_hpa, wind_speed_mps, wind_direction_deg, rainfall_mm, is_raining
            )
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            on conflict (session_id, recorded_at) do update
            set air_temp_c = excluded.air_temp_c,
                track_temp_c = excluded.track_temp_c,
                humidity_pct = excluded.humidity_pct,
                is_raining = excluded.is_raining
            """,
            rows,
        )
        return len(rows)

    async def _load_stints(
        self,
        extract: SessionExtract,
        session_id: UUID,
        team_ids: dict[str, UUID],
        driver_ids: dict[int, UUID],
    ) -> int:
        rows = []
        for row in records(extract.stints):
            driver_id = driver_ids.get(int(row["driver_number"]))
            if not driver_id:
                continue
            rows.append(
                (
                    session_id,
                    driver_id,
                    team_ids.get(str(row.get("team_name"))),
                    int(row["stint_number"]),
                    row.get("compound", "unknown"),
                    int(row["start_lap"]),
                    clean_value(row.get("end_lap")),
                    int(row.get("start_tyre_age_laps") or 0),
                    clean_value(row.get("laps_completed")),
                    clean_value(row.get("degradation_slope_ms_per_lap")),
                )
            )
        await self._executemany(
            """
            insert into public.stints (
              session_id, driver_id, team_id, stint_number, compound, start_lap, end_lap,
              start_tyre_age_laps, laps_completed, degradation_slope_ms_per_lap
            )
            values ($1, $2, $3, $4, $5::public.tyre_compound, $6, $7, $8, $9, $10)
            on conflict (session_id, driver_id, stint_number) do update
            set compound = excluded.compound,
                start_lap = excluded.start_lap,
                end_lap = excluded.end_lap,
                laps_completed = excluded.laps_completed,
                degradation_slope_ms_per_lap = excluded.degradation_slope_ms_per_lap
            """,
            rows,
        )
        return len(rows)

    async def _load_pit_stops(
        self, extract: SessionExtract, session_id: UUID, driver_ids: dict[int, UUID]
    ) -> int:
        rows = []
        for row in records(extract.pit_stops):
            driver_id = driver_ids.get(int(row["driver_number"]))
            if not driver_id:
                continue
            rows.append(
                (
                    session_id,
                    driver_id,
                    int(row["lap_number"]),
                    int(row["stop_number"]),
                    clean_value(row.get("stationary_ms")),
                    clean_value(row.get("total_pit_lane_ms")),
                    row.get("compound_from"),
                    row.get("compound_to"),
                )
            )
        await self._executemany(
            """
            insert into public.pit_stops (
              session_id, driver_id, lap_number, stop_number, stationary_ms,
              total_pit_lane_ms, compound_from, compound_to
            )
            values ($1, $2, $3, $4, $5, $6, $7::public.tyre_compound, $8::public.tyre_compound)
            on conflict (session_id, driver_id, stop_number) do update
            set lap_number = excluded.lap_number,
                stationary_ms = excluded.stationary_ms,
                total_pit_lane_ms = excluded.total_pit_lane_ms,
                compound_from = excluded.compound_from,
                compound_to = excluded.compound_to
            """,
            rows,
        )
        return len(rows)

    async def _load_positions(
        self, extract: SessionExtract, session_id: UUID, driver_ids: dict[int, UUID]
    ) -> int:
        rows = []
        for row in records(extract.positions):
            driver_id = driver_ids.get(int(row["driver_number"]))
            if not driver_id:
                continue
            rows.append(
                (
                    session_id,
                    driver_id,
                    row.get("recorded_at"),
                    int(row["position"]),
                    row.get("source", extract.source),
                )
            )
        await self._executemany(
            """
            insert into public.position_snapshots (
              session_id,
              driver_id,
              recorded_at,
              position,
              source
            )
            values ($1, $2, $3, $4, $5)
            on conflict (session_id, driver_id, recorded_at) do update
            set position = excluded.position,
                source = excluded.source
            """,
            rows,
        )
        return len(rows)

    async def _executemany(self, query: str, rows: list[tuple[Any, ...]]) -> None:
        if not rows:
            return
        for start in range(0, len(rows), self.batch_size):
            await self.connection.executemany(query, rows[start : start + self.batch_size])

    @staticmethod
    def _json(value: dict[str, Any]) -> str:
        import json

        return json.dumps(value, default=str)

    @staticmethod
    def _valid_color(value: Any) -> bool:
        return isinstance(value, str) and len(value) == 7 and value.startswith("#")
