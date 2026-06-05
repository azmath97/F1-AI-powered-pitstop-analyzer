from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

import httpx

from app.schemas.live import LiveDriverState, LiveRaceSnapshot

OPENF1_BASE_URL = "https://api.openf1.org/v1"
RACE_LAPS_BY_CIRCUIT: dict[str, int] = {
    "Monaco": 78,
    "Monte Carlo": 78,
    "Albert Park": 58,
    "Shanghai": 56,
    "Suzuka": 53,
    "Miami": 57,
    "Circuit Gilles-Villeneuve": 70,
    "Silverstone": 52,
}


async def build_live_race_snapshot(now: datetime | None = None) -> LiveRaceSnapshot:
    now_utc = now or datetime.now(UTC)
    async with httpx.AsyncClient(base_url=OPENF1_BASE_URL, timeout=8.0) as client:
        try:
            latest_session = await _latest_session(client)
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code in {401, 403}:
                return _no_live_race(
                    "OpenF1 real-time latest-session access is not authorized. "
                    "No LIVE race data is shown without verified OpenF1 access.",
                    now_utc,
                )
            raise
        except httpx.RequestError:
            return _no_live_race(
                "OpenF1 latest-session status could not be reached. "
                "No fallback LIVE data is shown.",
                now_utc,
            )
        if latest_session is None:
            return _no_live_race("No OpenF1 current session is available.", now_utc)

        session_name = str(latest_session.get("session_name") or "")
        session_type = str(latest_session.get("session_type") or session_name)
        race_name = _race_name(latest_session)
        session_key = str(latest_session.get("session_key") or "openf1-latest")

        if not _is_race_session(session_name, session_type):
            return _no_live_race(
                f"Latest OpenF1 session is {session_name or session_type}, not Race.",
                now_utc,
                race=race_name,
                session_key=session_key,
                session=session_name or session_type,
                session_type=session_type,
            )

        start = _parse_openf1_datetime(latest_session.get("date_start"))
        end = _parse_openf1_datetime(latest_session.get("date_end"))
        if start and now_utc < start:
            return _no_live_race(
                "The latest Race session has not started.",
                now_utc,
                race=race_name,
                session_key=session_key,
                session=session_name or "Race",
                session_type=session_type,
            )
        if end and now_utc > end:
            return _no_live_race(
                "The latest Race session has ended.",
                now_utc,
                race=race_name,
                session_key=session_key,
                session=session_name or "Race",
                session_type=session_type,
            )

        session_key_value = latest_session.get("session_key")
        drivers_payload = await _openf1_get(client, "drivers", {"session_key": session_key_value})
        position_payload = await _openf1_get(client, "position", {"session_key": session_key_value})
        stint_payload = await _openf1_get(client, "stints", {"session_key": session_key_value})
        weather_payload = await _openf1_get(client, "weather", {"session_key": session_key_value})

    drivers = _build_driver_states(drivers_payload, position_payload, stint_payload)
    weather = weather_payload[-1] if weather_payload else {}
    current_lap = _current_lap(position_payload, stint_payload)
    selected_driver = drivers[0] if drivers else None

    return LiveRaceSnapshot(
        sessionKey=session_key,
        race=race_name,
        session=session_name or "Race",
        sessionType=session_type,
        status="live",
        currentLap=current_lap,
        totalLaps=_total_laps(latest_session),
        trackTempC=float(weather.get("track_temperature") or 0),
        airTempC=float(weather.get("air_temperature") or 0),
        rainfall=float(weather.get("rainfall") or 0),
        leader=drivers[0].driver if drivers else None,
        selectedDriver=selected_driver,
        drivers=drivers,
        updatedAt=now_utc,
        reason=None,
    )


async def _latest_session(client: httpx.AsyncClient) -> dict[str, Any] | None:
    sessions = await _openf1_get(client, "sessions", {"session_key": "latest"})
    return sessions[0] if sessions else None


async def _openf1_get(
    client: httpx.AsyncClient,
    path: str,
    params: dict[str, Any],
) -> list[dict[str, Any]]:
    response = await client.get(f"/{path}", params=params)
    response.raise_for_status()
    payload = response.json()
    return payload if isinstance(payload, list) else []


def _build_driver_states(
    drivers_payload: list[dict[str, Any]],
    position_payload: list[dict[str, Any]],
    stint_payload: list[dict[str, Any]],
) -> list[LiveDriverState]:
    latest_positions: dict[int, dict[str, Any]] = {}
    for row in position_payload:
        driver_number = _int_or_none(row.get("driver_number"))
        if driver_number is not None:
            latest_positions[driver_number] = row

    latest_stints: dict[int, dict[str, Any]] = {}
    for row in stint_payload:
        driver_number = _int_or_none(row.get("driver_number"))
        if driver_number is not None:
            latest_stints[driver_number] = row

    drivers: list[LiveDriverState] = []
    for row in drivers_payload:
        driver_number = _int_or_none(row.get("driver_number"))
        if driver_number is None:
            continue
        position_row = latest_positions.get(driver_number, {})
        stint_row = latest_stints.get(driver_number, {})
        position = _int_or_none(position_row.get("position")) or 99
        drivers.append(
            LiveDriverState(
                driver=str(row.get("name_acronym") or row.get("broadcast_name") or driver_number),
                team=str(row.get("team_name") or "Unknown"),
                position=position,
                gapToLeader=0.0 if position == 1 else 0.0,
                gapAhead=None if position == 1 else 0.0,
                tyreCompound=_compound_or_unknown(stint_row.get("compound")),
                tyreAge=max(0, _current_stint_age(stint_row)),
                speed=0,
                throttle=0,
                brake=0,
                gear=0,
                rpm=0,
                drs=False,
                ers=0,
                delta=0,
                x=0,
                y=float(position * -8),
                sector=1,
            )
        )
    return sorted(drivers, key=lambda driver: driver.position)


def _no_live_race(
    reason: str,
    now_utc: datetime,
    race: str = "No live Grand Prix race",
    session_key: str = "openf1-latest",
    session: str = "Race",
    session_type: str | None = None,
) -> LiveRaceSnapshot:
    return LiveRaceSnapshot(
        sessionKey=session_key,
        race=race,
        session=session,
        sessionType=session_type,
        status="upcoming",
        currentLap=0,
        totalLaps=1,
        trackTempC=0,
        airTempC=0,
        rainfall=0,
        leader=None,
        selectedDriver=None,
        drivers=[],
        updatedAt=now_utc,
        reason=reason,
    )


def _is_race_session(session_name: str, session_type: str) -> bool:
    return session_name.strip().lower() == "race" or session_type.strip().lower() == "race"


def _race_name(session: dict[str, Any]) -> str:
    name = str(session.get("meeting_name") or session.get("location") or "Grand Prix")
    return name if "grand prix" in name.lower() else f"{name} GP"


def _parse_openf1_datetime(value: object) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed.astimezone(UTC)


def _total_laps(session: dict[str, Any]) -> int:
    circuit = str(session.get("circuit_short_name") or session.get("location") or "")
    return RACE_LAPS_BY_CIRCUIT.get(circuit, 1)


def _current_lap(
    position_payload: list[dict[str, Any]],
    stint_payload: list[dict[str, Any]],
) -> int:
    laps = [
        lap
        for row in [*position_payload, *stint_payload]
        if (lap := _int_or_none(row.get("lap_number"))) is not None
    ]
    return max(laps, default=0)


def _current_stint_age(row: dict[str, Any]) -> int:
    start = _int_or_none(row.get("lap_start")) or 0
    end = _int_or_none(row.get("lap_end")) or start
    return max(0, end - start + 1)


def _int_or_none(value: object) -> int | None:
    try:
        return int(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None


def _compound_or_unknown(value: object) -> str:
    compound = str(value or "Unknown").strip().title()
    return compound if compound in {"Soft", "Medium", "Hard", "Intermediate", "Wet"} else "Unknown"
