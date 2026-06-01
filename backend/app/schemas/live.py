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
    status: RaceStatus
    currentLap: int = Field(ge=0)
    totalLaps: int = Field(gt=0)
    trackTempC: float
    airTempC: float
    rainfall: float = Field(ge=0)
    leader: str
    selectedDriver: LiveDriverState
    drivers: list[LiveDriverState]
    pitRecommendationLap: int
    undercutProbability: float = Field(ge=0, le=1)
    overcutProbability: float = Field(ge=0, le=1)
    expectedGainSeconds: float
    confidence: float = Field(ge=0, le=1)
    risk: float = Field(ge=0, le=1)
    updatedAt: datetime
