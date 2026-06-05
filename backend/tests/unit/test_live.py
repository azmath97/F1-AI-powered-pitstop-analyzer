from fastapi.testclient import TestClient

from app.api.v1.routers import live
from app.main import app
from app.schemas.live import LiveRaceSnapshot


def test_live_session_contract(monkeypatch) -> None:
    async def fake_live_snapshot() -> LiveRaceSnapshot:
        return LiveRaceSnapshot(
            sessionKey="openf1-latest",
            race="Monaco GP",
            session="Practice 2",
            sessionType="Practice",
            status="upcoming",
            currentLap=0,
            totalLaps=1,
            trackTempC=0,
            airTempC=0,
            rainfall=0,
            drivers=[],
            updatedAt="2026-06-05T12:00:00Z",
            reason="Latest OpenF1 session is Practice 2, not Race.",
        )

    monkeypatch.setattr(live, "build_live_race_snapshot", fake_live_snapshot)

    client = TestClient(app)
    response = client.get("/api/v1/live/session")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "upcoming"
    assert payload["race"] == "Monaco GP"
    assert payload["selectedDriver"] is None
    assert payload["pitRecommendationLap"] is None
    assert payload["drivers"] == []
    assert "not Race" in payload["reason"]
