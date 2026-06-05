from __future__ import annotations

from math import isfinite
from pathlib import Path

import fastf1

from app.core.config import get_settings
from app.schemas.race_data import (
    CircuitMapPoint,
    CircuitMapSummary,
    PitStopSummary,
    SessionSummary,
)


def build_session_summary(
    season: int,
    round_number: int,
    session_type: str,
    driver: str | None = None,
) -> SessionSummary:
    _enable_fastf1_cache()
    session_identifier = _fastf1_session_identifier(session_type)
    session = fastf1.get_session(season, round_number, session_identifier)
    session.load(laps=True, telemetry=False, weather=False, messages=False)
    laps = session.laps
    strategy_session = _is_strategy_session(session_type)
    pit_rows = (
        laps[laps["PitInTime"].notna() | laps["PitOutTime"].notna()].copy()
        if strategy_session
        else laps.head(0).copy()
    )

    pit_stops: list[PitStopSummary] = []
    stop_counts: dict[str, int] = {}
    pending_in_laps: dict[str, dict[str, object]] = {}
    for _, row in pit_rows.sort_values(["Driver", "LapNumber"]).iterrows():
        row_driver = str(row["Driver"])
        has_pit_in = _string_or_none(row.get("PitInTime")) is not None
        has_pit_out = _string_or_none(row.get("PitOutTime")) is not None

        if has_pit_in:
            pending_in_laps[row_driver] = {
                "lap": int(row["LapNumber"]),
                "compound": _compound_or_none(row.get("Compound")),
                "pit_in_time": _string_or_none(row.get("PitInTime")),
            }

        if not has_pit_out:
            continue

        pending = pending_in_laps.pop(row_driver, None)
        stop_counts[row_driver] = stop_counts.get(row_driver, 0) + 1
        pit_stops.append(
            PitStopSummary(
                driver=row_driver,
                lap=int(pending["lap"]) if pending else int(row["LapNumber"]),
                stopNumber=stop_counts[row_driver],
                compoundBefore=(
                    str(pending["compound"]) if pending and pending["compound"] else None
                ),
                compoundAfter=_compound_or_none(row.get("Compound")),
                pitInTime=str(pending["pit_in_time"]) if pending else None,
                pitOutTime=_string_or_none(row.get("PitOutTime")),
            )
        )

    selected_driver = driver.upper() if driver else None
    selected_driver_pit_stops = [
        stop for stop in pit_stops if selected_driver is not None and stop.driver == selected_driver
    ]

    return SessionSummary(
        season=season,
        round=round_number,
        raceName=str(session.event.get("EventName", f"Round {round_number}")),
        session=session_type,
        selectedDriver=selected_driver,
        totalPitStops=len(pit_stops),
        driversWithPitStops=sorted({stop.driver for stop in pit_stops}),
        pitStops=pit_stops,
        selectedDriverPitStops=selected_driver_pit_stops,
    )


def build_circuit_map(
    season: int,
    round_number: int,
    session_type: str,
    driver: str | None = None,
) -> CircuitMapSummary:
    _enable_fastf1_cache()
    session = fastf1.get_session(season, round_number, session_type)
    session.load(laps=True, telemetry=True, weather=False, messages=False)

    laps = session.laps
    selected_driver = driver.upper() if driver else None
    if selected_driver:
        laps = laps.pick_driver(selected_driver)
    if laps.empty:
        raise ValueError(f"No laps found for driver {selected_driver or 'field'}")

    fastest_lap = laps.pick_fastest()
    if fastest_lap is None:
        raise ValueError("No fastest lap available for circuit map")

    telemetry = fastest_lap.get_telemetry()
    if telemetry.empty or "X" not in telemetry or "Y" not in telemetry:
        raise ValueError("FastF1 telemetry does not include X/Y circuit coordinates")

    step = max(1, len(telemetry) // 450)
    points: list[CircuitMapPoint] = []
    for _, row in telemetry.iloc[::step].iterrows():
        x = _float_or_none(row.get("X"))
        y = _float_or_none(row.get("Y"))
        if x is None or y is None:
            continue
        points.append(
            CircuitMapPoint(
                x=x,
                y=y,
                speed=_float_or_none(row.get("Speed")),
                distance=_float_or_none(row.get("Distance")),
            )
        )

    if len(points) < 10:
        raise ValueError("Not enough valid FastF1 circuit coordinates to render a map")

    return CircuitMapSummary(
        season=season,
        round=round_number,
        raceName=str(session.event.get("EventName", f"Round {round_number}")),
        session=session_type,
        driver=str(fastest_lap["Driver"]),
        points=points,
    )


def _enable_fastf1_cache() -> None:
    settings = get_settings()
    cache_dir = Path(settings.fastf1_cache_dir)
    cache_dir.mkdir(parents=True, exist_ok=True)
    fastf1.Cache.enable_cache(str(cache_dir))


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


def _is_strategy_session(session_type: str) -> bool:
    normalized = session_type.strip().lower()
    return normalized in {"race", "sprint"}


def _fastf1_session_identifier(session_type: str) -> str:
    normalized = session_type.strip().lower()
    mapping = {
        "practice": "FP1",
        "practice 1": "FP1",
        "fp1": "FP1",
        "practice 2": "FP2",
        "fp2": "FP2",
        "practice 3": "FP3",
        "fp3": "FP3",
        "qualifying": "Q",
        "q": "Q",
        "race": "R",
        "r": "R",
        "sprint": "S",
        "s": "S",
    }
    return mapping.get(normalized, session_type)


def _float_or_none(value: object) -> float | None:
    try:
        parsed = float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None
    return parsed if isfinite(parsed) else None
