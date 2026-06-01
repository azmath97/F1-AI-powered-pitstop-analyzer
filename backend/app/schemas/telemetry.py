from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TelemetrySampleRead(BaseModel):
    id: int
    session_id: UUID
    driver_id: UUID
    lap_id: UUID | None = None
    sample_time: datetime
    distance_m: float | None = Field(default=None, ge=0)
    speed_kph: float | None = Field(default=None, ge=0)
    throttle_pct: float | None = Field(default=None, ge=0, le=100)
    brake_pct: float | None = Field(default=None, ge=0, le=100)
    gear: int | None = Field(default=None, ge=0, le=8)
    rpm: int | None = Field(default=None, ge=0)
    drs: int | None = None
    x: float | None = None
    y: float | None = None
    z: float | None = None

    model_config = ConfigDict(from_attributes=True)
