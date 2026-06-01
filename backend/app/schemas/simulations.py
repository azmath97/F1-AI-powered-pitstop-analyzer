from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    session_id: UUID
    driver_id: UUID | None = None
    scenario_type: str
    name: str
    parameters: dict[str, Any] = Field(default_factory=dict)
    iterations: int = Field(default=10000, gt=0, le=250000)


class SimulationAccepted(BaseModel):
    simulation_id: UUID
    status: str


class StrategySimulationRequest(BaseModel):
    driver_id: UUID
    track: str
    current_lap: int = Field(gt=0)
    tyre_compound: str
    tyre_age_laps: int = Field(ge=0)
    gap_ahead_ms: int | None = None
    gap_behind_ms: int | None = None
    weather: dict[str, Any] = Field(default_factory=dict)
    feature_overrides: dict[str, Any] = Field(default_factory=dict)
    iterations: int = Field(default=10000, ge=100, le=250000)
    min_pit_lap: int = Field(default=10, ge=1)
    max_pit_lap: int = Field(default=50, ge=1)


class OptimalPitWindow(BaseModel):
    start_lap: int
    end_lap: int
    best_lap: int


class PitLapSimulationResult(BaseModel):
    pit_lap: int
    expected_gain_ms: float
    expected_position: float
    confidence_score: float
    risk_score: float


class StrategySimulationResponse(BaseModel):
    optimal_pit_window: OptimalPitWindow
    expected_gain_ms: float
    expected_position: float
    confidence_score: float = Field(ge=0, le=1)
    risk_score: float = Field(ge=0, le=1)
    iterations: int
    pit_lap_results: list[PitLapSimulationResult]
