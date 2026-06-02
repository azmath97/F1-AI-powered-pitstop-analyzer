from fastapi import APIRouter

from app.api.v1.routers import (
    circuits,
    drivers,
    live,
    predictions,
    race_data,
    sessions,
    simulations,
    strategy,
    teams,
)

api_router = APIRouter()
api_router.include_router(drivers.router, prefix="/drivers", tags=["drivers"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(circuits.router, prefix="/circuits", tags=["circuits"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(strategy.router, prefix="/strategy", tags=["strategy"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
api_router.include_router(simulations.router, prefix="/simulations", tags=["simulations"])
api_router.include_router(live.router, prefix="/live", tags=["live"])
api_router.include_router(race_data.router, prefix="/race-data", tags=["race-data"])
