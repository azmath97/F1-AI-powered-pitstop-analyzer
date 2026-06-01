from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class PredictionBaseRequest(BaseModel):
    session_id: UUID
    driver_id: UUID
    lap_number: int = Field(gt=0)
    feature_overrides: dict[str, Any] = Field(default_factory=dict)


class UndercutPredictionRequest(PredictionBaseRequest):
    target_driver_id: UUID | None = None


class OvercutPredictionRequest(PredictionBaseRequest):
    target_driver_id: UUID | None = None


class TyrePredictionRequest(PredictionBaseRequest):
    compound: str
    tyre_age_laps: int = Field(ge=0)


class PredictionAccepted(BaseModel):
    request_id: UUID
    status: str
