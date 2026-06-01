from fastapi import APIRouter

from app.schemas.circuits import CircuitRead

router = APIRouter()


@router.get("", response_model=list[CircuitRead])
async def list_circuits() -> list[CircuitRead]:
    return []
