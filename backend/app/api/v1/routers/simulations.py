from fastapi import APIRouter, HTTPException

from app.schemas.simulations import StrategySimulationRequest, StrategySimulationResponse
from app.services.model_inference import ModelInferenceService
from app.services.strategy_simulator import MonteCarloStrategySimulator, SimulationInputs

router = APIRouter()


@router.post("/strategy", response_model=StrategySimulationResponse)
async def run_strategy_simulation(
    request: StrategySimulationRequest,
) -> StrategySimulationResponse:
    simulator = MonteCarloStrategySimulator(ModelInferenceService())
    try:
        result = simulator.simulate(
            SimulationInputs(
                driver_id=str(request.driver_id),
                track=request.track,
                current_lap=request.current_lap,
                tyre_compound=request.tyre_compound,
                tyre_age_laps=request.tyre_age_laps,
                gap_ahead_ms=request.gap_ahead_ms,
                gap_behind_ms=request.gap_behind_ms,
                weather=request.weather,
                feature_overrides=request.feature_overrides,
                iterations=request.iterations,
                min_pit_lap=request.min_pit_lap,
                max_pit_lap=request.max_pit_lap,
            )
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return StrategySimulationResponse(**result)
