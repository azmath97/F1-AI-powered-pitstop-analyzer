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
    pending_in_laps: dict[str, dict[str, object]] = {}
    for _, row in pit_rows.sort_values(["Driver", "LapNumber"]).iterrows():
        driver = str(row["Driver"])
        has_pit_in = _string_or_none(row.get("PitInTime")) is not None
        has_pit_out = _string_or_none(row.get("PitOutTime")) is not None

        if has_pit_in:
            pending_in_laps[driver] = {
                "lap": int(row["LapNumber"]),
                "compound": _compound_or_none(row.get("Compound")),
                "pit_in_time": _string_or_none(row.get("PitInTime")),
            }

        if not has_pit_out:
            continue

        pending = pending_in_laps.pop(driver, None)
        stop_counts[driver] = stop_counts.get(driver, 0) + 1
        pit_stops.append(
            PitStopSummary(
                driver=driver,
                lap=int(pending["lap"]) if pending else int(row["LapNumber"]),
                stopNumber=stop_counts[driver],
                compoundBefore=(
                    str(pending["compound"]) if pending and pending["compound"] else None
                ),
                compoundAfter=_compound_or_none(row.get("Compound")),
                pitInTime=str(pending["pit_in_time"]) if pending else None,
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


def _compound_or_none(value: object) -> str | None:
    compound = _string_or_none(value)
    if compound is None:
        return None
    normalized = compound.strip().lower().replace("_", " ")
    mapping = {
        "soft": "Soft",
        "medium": "Medium",
        "hard": "Hard",
        "intermediate": "Intermediate",
        "wet": "Wet",
        "unknown": "Unknown",
    }
    return mapping.get(normalized, "Unknown")
