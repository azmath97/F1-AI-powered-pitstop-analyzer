from datetime import UTC, datetime

from fastapi import APIRouter

from app.schemas.live import LiveDriverState, LiveRaceSnapshot

router = APIRouter()


@router.get("/session", response_model=LiveRaceSnapshot)
async def get_live_session() -> LiveRaceSnapshot:
    """Return the current OpenF1 live-session projection.

    This endpoint is intentionally shaped as the production contract; the data
    source can be swapped from fixture projection to OpenF1 streaming without
    changing the frontend client.
    """

    drivers = [
        LiveDriverState(
            driver=code,
            team=team,
            position=index + 1,
            gapToLeader=round(index * 2.6, 1),
            gapAhead=None if index == 0 else 1.2,
            tyreCompound=["Hard", "Soft", "Medium"][index % 3],
            tyreAge=11 + index * 2,
            speed=242 + index * 5,
            throttle=80,
            brake=0 if index % 2 else 18,
            gear=7,
            rpm=10800 + index * 180,
            drs=index in {1, 2, 3},
            ers=72 - index * 4,
            delta=round(index * 0.08 - 0.18, 2),
            x=112.0,
            y=float(index * 14 - 48),
            sector=(index % 3) + 1,
        )
        for index, (code, team) in enumerate(
            [
                ("VER", "Red Bull"),
                ("LEC", "Ferrari"),
                ("NOR", "McLaren"),
                ("HAM", "Ferrari"),
                ("PIA", "McLaren"),
                ("RUS", "Mercedes"),
            ]
        )
    ]

    return LiveRaceSnapshot(
        sessionKey="openf1-live-2026-bahrain-race",
        race="Bahrain GP",
        session="Race",
        status="live",
        currentLap=22,
        totalLaps=57,
        trackTempC=38,
        airTempC=27,
        rainfall=0,
        leader="VER",
        selectedDriver=drivers[2],
        drivers=drivers,
        pitRecommendationLap=24,
        undercutProbability=0.81,
        overcutProbability=0.42,
        expectedGainSeconds=4.1,
        confidence=0.87,
        risk=0.23,
        updatedAt=datetime.now(UTC),
    )
