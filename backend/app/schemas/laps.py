from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class LapRead(BaseModel):
    id: UUID
    session_id: UUID
    driver_id: UUID
    team_id: UUID | None = None
    lap_number: int = Field(gt=0)
    position: int | None = Field(default=None, gt=0)
    lap_time_ms: int | None = Field(default=None, gt=0)
    compound: str
    tyre_age_laps: int = Field(ge=0)
    stint_number: int | None = Field(default=None, gt=0)

    model_config = ConfigDict(from_attributes=True)
