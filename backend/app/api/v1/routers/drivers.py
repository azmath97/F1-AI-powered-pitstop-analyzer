from fastapi import APIRouter

from app.schemas.drivers import DriverRead

router = APIRouter()


@router.get("", response_model=list[DriverRead])
async def list_drivers() -> list[DriverRead]:
    return []
