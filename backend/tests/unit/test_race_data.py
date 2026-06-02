from fastapi.testclient import TestClient

from app.api.v1.routers import race_data
from app.main import app
from app.schemas.race_data import PitStopSummary, SessionSummary


def test_session_summary_route(monkeypatch) -> None:
    def fake_summary(season: int, round_number: int, session_type: str) -> SessionSummary:
        return SessionSummary(
            season=season,
            round=round_number,
            raceName="British GP",
            session=session_type,
            pitStops=[
                PitStopSummary(driver="NOR", lap=23, stopNumber=1),
                PitStopSummary(driver="PIA", lap=24, stopNumber=1),
            ],
        )

    monkeypatch.setattr(race_data, "build_session_summary", fake_summary)

    client = TestClient(app)
    response = client.get("/api/v1/race-data/session-summary?season=2025&round=12&session=Race")

    assert response.status_code == 200
    payload = response.json()
    assert payload["raceName"] == "British GP"
    assert len(payload["pitStops"]) == 2
