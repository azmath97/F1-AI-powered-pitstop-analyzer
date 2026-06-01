from fastapi import APIRouter, HTTPException, status

from app.schemas.simulations import SimulationAccepted, SimulationRequest

router = APIRouter()


@router.post("", response_model=SimulationAccepted, status_code=status.HTTP_202_ACCEPTED)
async def request_simulation(_: SimulationRequest) -> SimulationAccepted:
    raise HTTPException(status_code=501, detail="Race simulation execution is not implemented yet.")
