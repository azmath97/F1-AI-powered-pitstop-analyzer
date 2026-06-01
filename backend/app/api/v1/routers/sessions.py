from uuid import UUID

from fastapi import APIRouter

from app.schemas.laps import LapRead
from app.schemas.sessions import SessionRead
from app.schemas.telemetry import TelemetrySampleRead

router = APIRouter()


@router.get("", response_model=list[SessionRead])
async def list_sessions() -> list[SessionRead]:
    return []


@router.get("/{session_id}", response_model=SessionRead | None)
async def get_session(session_id: UUID) -> SessionRead | None:
    _ = session_id
    return None


@router.get("/{session_id}/laps", response_model=list[LapRead])
async def list_session_laps(session_id: UUID) -> list[LapRead]:
    _ = session_id
    return []


@router.get("/{session_id}/telemetry", response_model=list[TelemetrySampleRead])
async def list_session_telemetry(
    session_id: UUID,
    driver_id: UUID | None = None,
    lap_number: int | None = None,
) -> list[TelemetrySampleRead]:
    _ = (session_id, driver_id, lap_number)
    return []
