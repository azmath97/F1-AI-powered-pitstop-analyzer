from typing import Literal

from pydantic import BaseModel, Field


class PitStopSummary(BaseModel):
    driver: str
    lap: int = Field(gt=0)
    stopNumber: int = Field(gt=0)
    compoundBefore: str | None = None
    compoundAfter: str | None = None
    pitInTime: str | None = None
    pitOutTime: str | None = None


class SessionSummary(BaseModel):
    season: int
    round: int
    raceName: str
    session: str
    source: Literal["fastf1", "database"] = "fastf1"
    selectedDriver: str | None = None
    totalPitStops: int = Field(ge=0, default=0)
    driversWithPitStops: list[str] = Field(default_factory=list)
    pitStops: list[PitStopSummary]
    selectedDriverPitStops: list[PitStopSummary] = Field(default_factory=list)


class CircuitMapPoint(BaseModel):
    x: float
    y: float
    speed: float | None = None
    distance: float | None = None


class CircuitMapSummary(BaseModel):
    season: int
    round: int
    raceName: str
    session: str
    driver: str
    source: Literal["fastf1", "database"] = "fastf1"
    points: list[CircuitMapPoint]
