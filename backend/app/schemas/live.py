from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

TyreCompound = Literal["Soft", "Medium", "Hard", "Intermediate", "Wet", "Unknown"]
RaceStatus = Literal["live", "upcoming", "completed", "cancelled"]


class LiveDriverState(BaseModel):
    driver: str
    team: str
    position: int = Field(ge=1)
    gapToLeader: float
    gapAhead: float | None
    tyreCompound: TyreCompound
    tyreAge: int = Field(ge=0)
    speed: float
    throttle: float = Field(ge=0, le=100)
    brake: float = Field(ge=0, le=100)
    gear: int = Field(ge=0, le=8)
    rpm: int = Field(ge=0)
    drs: bool
    ers: float = Field(ge=0, le=100)
    delta: float
    x: float
    y: float
    sector: Literal[1, 2, 3]


class LiveRaceSnapshot(BaseModel):
    sessionKey: str
    race: str
    session: str
    sessionType: str | None = None
    status: RaceStatus
    currentLap: int = Field(ge=0)
    totalLaps: int = Field(gt=0)
    trackTempC: float
    airTempC: float
    rainfall: float = Field(ge=0)
    leader: str | None = None
    selectedDriver: LiveDriverState | None = None
    drivers: list[LiveDriverState]
    pitRecommendationLap: int | None = None
    undercutProbability: float | None = Field(default=None, ge=0, le=1)
    overcutProbability: float | None = Field(default=None, ge=0, le=1)
    expectedGainSeconds: float | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    risk: float | None = Field(default=None, ge=0, le=1)
    updatedAt: datetime
    reason: str | None = None
