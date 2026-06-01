from uuid import UUID

from pydantic import BaseModel, Field


class CommandCenterRead(BaseModel):
    session_id: UUID
    driver_id: UUID
    current_lap: int = Field(gt=0)
    tyre_compound: str
    tyre_age_laps: int = Field(ge=0)
    current_position: int = Field(gt=0)
    gap_ahead_ms: int | None = None
    gap_behind_ms: int | None = None
    track_conditions: str
    pit_recommendation_lap: int | None = Field(default=None, gt=0)
    undercut_probability: float = Field(ge=0, le=1)
    overcut_probability: float = Field(ge=0, le=1)
    confidence: float = Field(ge=0, le=1)
