from app.services.strategy_simulator import MonteCarloStrategySimulator, SimulationInputs


class FakeModelProvider:
    def predict_tyre_remaining_laps(self, features):
        return {"prediction": 18.0, "confidence": 0.8}

    def predict_undercut_success(self, features):
        return {"probability": 0.72, "confidence": 0.75}

    def predict_overcut_success(self, features):
        return {"probability": 0.43, "confidence": 0.7}


def test_strategy_simulator_returns_optimal_window() -> None:
    simulator = MonteCarloStrategySimulator(FakeModelProvider())

    result = simulator.simulate(
        SimulationInputs(
            driver_id="driver-1",
            track="Silverstone",
            current_lap=20,
            tyre_compound="medium",
            tyre_age_laps=12,
            gap_ahead_ms=1800,
            gap_behind_ms=3200,
            weather={"rainfall_mm": 0.0, "track_temp_c": 33.0},
            feature_overrides={"track_position": 4},
            iterations=500,
            min_pit_lap=20,
            max_pit_lap=25,
        )
    )

    assert result["optimal_pit_window"]["best_lap"] in range(20, 26)
    assert 0 <= result["confidence_score"] <= 1
    assert 0 <= result["risk_score"] <= 1
    assert len(result["pit_lap_results"]) == 6
