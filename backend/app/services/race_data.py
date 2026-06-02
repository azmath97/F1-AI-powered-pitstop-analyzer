from __future__ import annotations

from pathlib import Path

import fastf1

from app.core.config import get_settings
from app.schemas.race_data import PitStopSummary, SessionSummary


def build_session_summary(season: int, round_number: int, session_type: str) -> SessionSummary:
    settings = get_settings()
    cache_dir = Path(settings.fastf1_cache_dir)
    cache_dir.mkdir(parents=True, exist_ok=True)
    fastf1.Cache.enable_cache(str(cache_dir))

    session = fastf1.get_session(season, round_number, session_type)
    session.load(laps=True, telemetry=False, weather=False, messages=False)
    laps = session.laps
    pit_rows = laps[laps["PitInTime"].notna() | laps["PitOutTime"].notna()].copy()

    pit_stops: list[PitStopSummary] = []
    stop_counts: dict[str, int] = {}
    for _, row in pit_rows.sort_values(["Driver", "LapNumber"]).iterrows():
        driver = str(row["Driver"])
        stop_counts[driver] = stop_counts.get(driver, 0) + 1
        pit_stops.append(
            PitStopSummary(
                driver=driver,
                lap=int(row["LapNumber"]),
                stopNumber=stop_counts[driver],
                compoundBefore=_string_or_none(row.get("Compound")),
                compoundAfter=None,
                pitInTime=_string_or_none(row.get("PitInTime")),
                pitOutTime=_string_or_none(row.get("PitOutTime")),
            )
        )

    return SessionSummary(
        season=season,
        round=round_number,
        raceName=str(session.event.get("EventName", f"Round {round_number}")),
        session=session_type,
        pitStops=pit_stops,
    )


def _string_or_none(value: object) -> str | None:
    if value is None:
        return None
    try:
        if value != value:
            return None
    except TypeError:
        pass
    return str(value)
