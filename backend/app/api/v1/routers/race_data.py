from fastapi import APIRouter, HTTPException, Query

from app.schemas.race_data import SessionSummary
from app.services.race_data import build_session_summary

router = APIRouter()


@router.get("/session-summary", response_model=SessionSummary)
async def get_session_summary(
    season: int = Query(ge=2018),
    round_number: int = Query(alias="round", gt=0),
    session: str = Query(default="Race"),
) -> SessionSummary:
    try:
        return build_session_summary(season, round_number, session)
    except Exception as exc:
        detail = (
            "FastF1 session data is not available for "
            f"{season} round {round_number} {session}: {exc}"
        )
        raise HTTPException(
            status_code=503,
            detail=detail,
        ) from exc
