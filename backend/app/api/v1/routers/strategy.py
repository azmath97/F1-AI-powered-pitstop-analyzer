from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.schemas.strategy import CommandCenterRead

router = APIRouter()


@router.get("/command-center", response_model=CommandCenterRead)
async def get_command_center(session_id: UUID, driver_id: UUID) -> CommandCenterRead:
    _ = (session_id, driver_id)
    raise HTTPException(
        status_code=501, detail="Strategy command center aggregation is not implemented yet."
    )
