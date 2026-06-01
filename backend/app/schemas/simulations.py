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
