from typing import Any

import asyncpg
import pandas as pd


def asyncpg_dsn(database_url: str) -> str:
    return database_url.replace("postgresql+asyncpg://", "postgresql://", 1)


class PostgresDataReader:
    def __init__(self, database_url: str) -> None:
        self.database_url = asyncpg_dsn(database_url)

    async def read_frame(self, query: str, *args: Any) -> pd.DataFrame:
        connection = await asyncpg.connect(self.database_url)
        try:
            rows = await connection.fetch(query, *args)
            return pd.DataFrame([dict(row) for row in rows])
        finally:
            await connection.close()

    async def load_feature_tables(self) -> dict[str, pd.DataFrame]:
        return {
            "laps": await self.read_frame(LAPS_QUERY),
            "weather": await self.read_frame(WEATHER_QUERY),
            "stints": await self.read_frame(STINTS_QUERY),
            "pit_stops": await self.read_frame(PIT_STOPS_QUERY),
            "telemetry": await self.read_frame(TELEMETRY_QUERY),
        }


LAPS_QUERY = """
select
  l.id as lap_id,
  l.session_id,
  s.season,
  s.circuit_id,
  c.name as circuit_name,
  c.country as circuit_country,
  c.length_m as circuit_length_m,
  s.total_laps,
  s.pit_lane_loss_ms,
  l.driver_id,
  d.driver_number,
  d.code as driver_code,
  l.team_id,
  t.name as team_name,
  l.lap_number,
  l.position,
  l.lap_time_ms,
  l.sector_1_ms,
  l.sector_2_ms,
  l.sector_3_ms,
  l.compound::text as compound,
  l.tyre_age_laps,
  l.stint_number,
  l.is_pit_in_lap,
  l.is_pit_out_lap,
  l.track_status
from public.laps l
join public.sessions s on s.id = l.session_id
join public.circuits c on c.id = s.circuit_id
join public.drivers d on d.id = l.driver_id
left join public.teams t on t.id = l.team_id
"""

WEATHER_QUERY = """
select
  session_id,
  lap_number,
  recorded_at,
  air_temp_c,
  track_temp_c,
  humidity_pct,
  pressure_hpa,
  wind_speed_mps,
  wind_direction_deg,
  rainfall_mm,
  is_raining
from public.weather
"""

STINTS_QUERY = """
select
  session_id,
  driver_id,
  stint_number,
  compound::text as compound,
  start_lap,
  end_lap,
  start_tyre_age_laps,
  laps_completed,
  degradation_slope_ms_per_lap
from public.stints
"""

PIT_STOPS_QUERY = """
select
  session_id,
  driver_id,
  lap_number,
  stop_number,
  stationary_ms,
  total_pit_lane_ms,
  compound_from::text as compound_from,
  compound_to::text as compound_to
from public.pit_stops
"""

TELEMETRY_QUERY = """
select
  session_id,
  driver_id,
  lap_id,
  distance_m,
  speed_kph,
  throttle_pct,
  brake_pct,
  gear,
  rpm,
  drs,
  x,
  y,
  z
from public.telemetry
"""
