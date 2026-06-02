from fastapi.testclient import TestClient

from app.api.v1.routers import race_data
from app.main import app
from app.schemas.race_data import CircuitMapPoint, CircuitMapSummary, PitStopSummary, SessionSummary


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


def test_circuit_map_route(monkeypatch) -> None:
    def fake_map(
        season: int,
        round_number: int,
        session_type: str,
        driver: str | None,
    ) -> CircuitMapSummary:
        return CircuitMapSummary(
            season=season,
            round=round_number,
            raceName="Monaco GP",
            session=session_type,
            driver=driver or "NOR",
            points=[
                CircuitMapPoint(x=0.0, y=0.0, speed=240.0, distance=0.0),
                CircuitMapPoint(x=1.0, y=1.0, speed=220.0, distance=20.0),
            ],
        )

    monkeypatch.setattr(race_data, "build_circuit_map", fake_map)

    client = TestClient(app)
    response = client.get(
        "/api/v1/race-data/circuit-map?season=2025&round=8&session=Race&driver=NOR"
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["raceName"] == "Monaco GP"
    assert payload["driver"] == "NOR"
    assert payload["points"][1]["speed"] == 220.0
