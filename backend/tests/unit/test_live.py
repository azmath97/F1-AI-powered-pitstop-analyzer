from fastapi.testclient import TestClient

from app.main import app


def test_live_session_contract() -> None:
    client = TestClient(app)
    response = client.get("/api/v1/live/session")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "live"
    assert payload["selectedDriver"]["driver"] == "NOR"
    assert payload["pitRecommendationLap"] > 0
    assert len(payload["drivers"]) >= 1
