from fastapi import APIRouter, HTTPException

from app.schemas.predictions import (
    OvercutPredictionRequest,
    StrategyProbabilityResponse,
    TyrePredictionRequest,
    TyrePredictionResponse,
    UndercutPredictionRequest,
)
from app.services.model_inference import ModelInferenceService, request_features

router = APIRouter()


@router.post("/undercut", response_model=StrategyProbabilityResponse)
async def request_undercut_prediction(
    request: UndercutPredictionRequest,
) -> StrategyProbabilityResponse:
    try:
        result = ModelInferenceService().predict_undercut_success(
            request_features(
                {
                    "lap_number": request.lap_number,
                    "driver_id": str(request.driver_id),
                    "target_driver_id": str(request.target_driver_id)
                    if request.target_driver_id
                    else None,
                },
                request.feature_overrides,
            )
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return StrategyProbabilityResponse(
        model_name=result["model_name"],
        model_version=result["model_version"],
        probability=result["probability"],
        confidence=result["confidence"],
        feature_snapshot=result["feature_snapshot"],
    )


@router.post("/overcut", response_model=StrategyProbabilityResponse)
async def request_overcut_prediction(
    request: OvercutPredictionRequest,
) -> StrategyProbabilityResponse:
    try:
        result = ModelInferenceService().predict_overcut_success(
            request_features(
                {
                    "lap_number": request.lap_number,
                    "driver_id": str(request.driver_id),
                    "target_driver_id": str(request.target_driver_id)
                    if request.target_driver_id
                    else None,
                },
                request.feature_overrides,
            )
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return StrategyProbabilityResponse(
        model_name=result["model_name"],
        model_version=result["model_version"],
        probability=result["probability"],
        confidence=result["confidence"],
        feature_snapshot=result["feature_snapshot"],
    )


@router.post("/tyres", response_model=TyrePredictionResponse)
async def request_tyre_prediction(request: TyrePredictionRequest) -> TyrePredictionResponse:
    try:
        result = ModelInferenceService().predict_tyre_remaining_laps(
            request_features(
                {
                    "lap_number": request.lap_number,
                    "compound": request.compound,
                    "tyre_age_laps": request.tyre_age_laps,
                    "driver_id": str(request.driver_id),
                },
                request.feature_overrides,
            )
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return TyrePredictionResponse(
        model_name=result["model_name"],
        model_version=result["model_version"],
        remaining_laps=result["prediction"],
        confidence=result["confidence"],
        feature_snapshot=result["feature_snapshot"],
    )
