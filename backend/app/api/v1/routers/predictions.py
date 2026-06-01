from fastapi import APIRouter, HTTPException, status

from app.schemas.predictions import (
    OvercutPredictionRequest,
    PredictionAccepted,
    TyrePredictionRequest,
    UndercutPredictionRequest,
)

router = APIRouter()


@router.post(
    "/undercut",
    response_model=PredictionAccepted,
    status_code=status.HTTP_202_ACCEPTED,
)
async def request_undercut_prediction(_: UndercutPredictionRequest) -> PredictionAccepted:
    raise HTTPException(status_code=501, detail="Undercut model inference is not implemented yet.")


@router.post(
    "/overcut",
    response_model=PredictionAccepted,
    status_code=status.HTTP_202_ACCEPTED,
)
async def request_overcut_prediction(_: OvercutPredictionRequest) -> PredictionAccepted:
    raise HTTPException(status_code=501, detail="Overcut model inference is not implemented yet.")


@router.post(
    "/tyres",
    response_model=PredictionAccepted,
    status_code=status.HTTP_202_ACCEPTED,
)
async def request_tyre_prediction(_: TyrePredictionRequest) -> PredictionAccepted:
    raise HTTPException(status_code=501, detail="Tyre model inference is not implemented yet.")
