from fastapi import APIRouter, HTTPException

from app.schemas.live import LiveRaceSnapshot
from app.services.live_race import build_live_race_snapshot

router = APIRouter()


@router.get("/session", response_model=LiveRaceSnapshot)
async def get_live_session() -> LiveRaceSnapshot:
    try:
        return await build_live_race_snapshot()
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"OpenF1 live race status is unavailable: {exc}",
        ) from exc
