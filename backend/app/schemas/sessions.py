from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SessionRead(BaseModel):
    id: UUID
    session_key: int | None = None
    circuit_id: UUID
    season: int = Field(ge=1950)
    round_number: int | None = Field(default=None, gt=0)
    name: str
    type: str
    status: str
    starts_at: datetime | None = None
    total_laps: int | None = Field(default=None, gt=0)
    pit_lane_loss_ms: int | None = Field(default=None, ge=0)

    model_config = ConfigDict(from_attributes=True)
