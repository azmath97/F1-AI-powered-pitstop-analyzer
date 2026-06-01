from fastapi import APIRouter

from app.schemas.teams import TeamRead

router = APIRouter()


@router.get("", response_model=list[TeamRead])
async def list_teams() -> list[TeamRead]:
    return []
