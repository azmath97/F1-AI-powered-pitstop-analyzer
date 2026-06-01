import pandas as pd

from f1_strategy_ml.features.overcut import OvercutFeatureBuilder
from f1_strategy_ml.features.tyre_degradation import TyreDegradationFeatureBuilder
from f1_strategy_ml.features.undercut import UndercutFeatureBuilder


def sample_laps() -> pd.DataFrame:
    rows = []
    for lap in range(1, 13):
        rows.append(
            {
                "session_id": "s1",
                "season": 2024,
                "circuit_id": "c1",
                "circuit_name": "Silverstone",
                "driver_id": "d1",
                "driver_number": 1,
                "lap_number": lap,
                "position": 2 if lap < 8 else 1,
                "lap_time_ms": 90000 + lap * 120,
                "compound": "medium",
                "tyre_age_laps": lap,
                "stint_number": 1,
                "pit_lane_loss_ms": 22000,
                "circuit_length_m": 5891,
                "total_laps": 52,
            }
        )
        rows.append(
            {
                "session_id": "s1",
                "season": 2024,
                "circuit_id": "c1",
                "circuit_name": "Silverstone",
                "driver_id": "d2",
                "driver_number": 2,
                "lap_number": lap,
                "position": 1 if lap < 8 else 2,
                "lap_time_ms": 89900 + lap * 160,
                "compound": "medium",
                "tyre_age_laps": lap + 2,
                "stint_number": 1,
                "pit_lane_loss_ms": 22000,
                "circuit_length_m": 5891,
                "total_laps": 52,
            }
        )
    return pd.DataFrame(rows)


def test_tyre_degradation_builder_generates_labels() -> None:
    laps = sample_laps()
    weather = pd.DataFrame(
        {
            "session_id": ["s1"],
            "lap_number": [1],
            "air_temp_c": [21.0],
            "track_temp_c": [32.0],
            "humidity_pct": [54.0],
            "wind_speed_mps": [2.0],
            "rainfall_mm": [0.0],
        }
    )

    dataset = TyreDegradationFeatureBuilder().build(laps, weather)

    assert "tyre_degradation_label_ms" in dataset.columns
    assert "remaining_laps_label" in dataset.columns
    assert len(dataset) == len(laps)


def test_undercut_builder_generates_success_label() -> None:
    laps = sample_laps()
    pit_stops = pd.DataFrame(
        {
            "session_id": ["s1"],
            "driver_id": ["d1"],
            "lap_number": [4],
            "stop_number": [1],
        }
    )

    dataset = UndercutFeatureBuilder().build(laps, pit_stops)

    assert "undercut_success_label" in dataset.columns
    assert set(dataset["undercut_success_label"]).issubset({0, 1})


def test_overcut_builder_generates_success_label() -> None:
    laps = sample_laps()
    pit_stops = pd.DataFrame(
        {
            "session_id": ["s1", "s1"],
            "driver_id": ["d2", "d1"],
            "lap_number": [4, 7],
            "stop_number": [1, 1],
        }
    )

    dataset = OvercutFeatureBuilder().build(laps, pit_stops)

    assert "overcut_success_label" in dataset.columns
    assert set(dataset["overcut_success_label"]).issubset({0, 1})
