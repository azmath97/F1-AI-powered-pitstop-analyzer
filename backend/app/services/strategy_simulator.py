from dataclasses import dataclass
from typing import Any, Protocol

import numpy as np


class StrategyModelProvider(Protocol):
    def predict_tyre_remaining_laps(self, features: dict[str, Any]) -> dict[str, Any]:
        """Predict remaining useful tyre life."""

    def predict_undercut_success(self, features: dict[str, Any]) -> dict[str, Any]:
        """Predict undercut success probability."""

    def predict_overcut_success(self, features: dict[str, Any]) -> dict[str, Any]:
        """Predict overcut success probability."""


@dataclass(frozen=True)
class SimulationInputs:
    driver_id: str
    track: str
    current_lap: int
    tyre_compound: str
    tyre_age_laps: int
    gap_ahead_ms: int | None
    gap_behind_ms: int | None
    weather: dict[str, Any]
    feature_overrides: dict[str, Any]
    iterations: int = 10000
    min_pit_lap: int = 10
    max_pit_lap: int = 50
    random_state: int = 42


@dataclass(frozen=True)
class PitLapOutcome:
    pit_lap: int
    expected_gain_ms: float
    expected_position: float
    confidence_score: float
    risk_score: float


class MonteCarloStrategySimulator:
    def __init__(self, model_provider: StrategyModelProvider) -> None:
        self.model_provider = model_provider

    def simulate(self, inputs: SimulationInputs) -> dict[str, Any]:
        rng = np.random.default_rng(inputs.random_state)
        pit_laps = range(
            max(inputs.min_pit_lap, inputs.current_lap),
            max(inputs.min_pit_lap, inputs.max_pit_lap) + 1,
        )
        outcomes = [self._simulate_pit_lap(inputs, pit_lap, rng) for pit_lap in pit_laps]
        if not outcomes:
            raise ValueError("No pit laps available for simulation.")
        best = max(outcomes, key=lambda outcome: outcome.expected_gain_ms)
        positive = [outcome.pit_lap for outcome in outcomes if outcome.expected_gain_ms > 0]
        optimal_window = {
            "start_lap": min(positive) if positive else best.pit_lap,
            "end_lap": max(positive) if positive else best.pit_lap,
            "best_lap": best.pit_lap,
        }
        return {
            "optimal_pit_window": optimal_window,
            "expected_gain_ms": best.expected_gain_ms,
            "expected_position": best.expected_position,
            "confidence_score": best.confidence_score,
            "risk_score": best.risk_score,
            "iterations": inputs.iterations,
            "pit_lap_results": [outcome.__dict__ for outcome in outcomes],
        }

    def _simulate_pit_lap(
        self,
        inputs: SimulationInputs,
        pit_lap: int,
        rng: np.random.Generator,
    ) -> PitLapOutcome:
        features = self._features(inputs, pit_lap)
        tyre = self.model_provider.predict_tyre_remaining_laps(features)
        undercut = self.model_provider.predict_undercut_success(features)
        overcut = self.model_provider.predict_overcut_success(features)

        remaining_laps = max(0.0, float(tyre["prediction"]))
        undercut_probability = float(undercut["probability"])
        overcut_probability = float(overcut["probability"])
        confidence = float(
            np.mean([tyre["confidence"], undercut["confidence"], overcut["confidence"]])
        )

        lap_delta = pit_lap - inputs.current_lap
        tyre_risk = max(0.0, min(1.0, (lap_delta - remaining_laps) / 12.0))
        traffic_risk = float(features.get("traffic_score", 0.0) or 0.0)
        weather_risk = min(1.0, float(inputs.weather.get("rainfall_mm", 0.0) or 0.0) / 5.0)
        risk = float(np.clip(np.mean([tyre_risk, traffic_risk, weather_risk]), 0.0, 1.0))

        strategic_probability = max(undercut_probability, overcut_probability)
        base_gain = (strategic_probability - 0.5) * 9000.0
        tyre_penalty = tyre_risk * 5000.0
        pit_timing_bonus = max(0, 8 - abs(lap_delta - remaining_laps)) * 120.0
        sampled_gain = rng.normal(
            loc=base_gain + pit_timing_bonus - tyre_penalty,
            scale=1200.0 + risk * 2200.0,
            size=inputs.iterations,
        )
        expected_gain = float(np.mean(sampled_gain))
        current_position = float(features.get("track_position", 5.0) or 5.0)
        expected_position = float(max(1.0, current_position - expected_gain / 2500.0))
        return PitLapOutcome(
            pit_lap=pit_lap,
            expected_gain_ms=expected_gain,
            expected_position=expected_position,
            confidence_score=confidence,
            risk_score=risk,
        )

    @staticmethod
    def _features(inputs: SimulationInputs, pit_lap: int) -> dict[str, Any]:
        gap_ahead_ms = inputs.gap_ahead_ms if inputs.gap_ahead_ms is not None else 3000
        gap_behind_ms = inputs.gap_behind_ms if inputs.gap_behind_ms is not None else 3000
        features = {
            "driver_id": inputs.driver_id,
            "track": inputs.track,
            "lap_number": pit_lap,
            "current_lap": inputs.current_lap,
            "compound": inputs.tyre_compound,
            "tyre_age_laps": inputs.tyre_age_laps + max(0, pit_lap - inputs.current_lap),
            "gap_ms": gap_ahead_ms,
            "gap_ahead_ms": gap_ahead_ms,
            "gap_behind_ms": gap_behind_ms,
            "track_position": inputs.feature_overrides.get("track_position", 5),
            "traffic_score": inputs.feature_overrides.get(
                "traffic_score",
                1.0 / max(1.0, (gap_ahead_ms + gap_behind_ms) / 1500.0),
            ),
            "clean_air_score": inputs.feature_overrides.get(
                "clean_air_score",
                min(1.0, gap_ahead_ms / 5000.0),
            ),
            "air_temp_c": inputs.weather.get("air_temp_c"),
            "track_temp_c": inputs.weather.get("track_temp_c"),
            "humidity_pct": inputs.weather.get("humidity_pct"),
            "rainfall_mm": inputs.weather.get("rainfall_mm", 0.0),
        }
        features.update(inputs.feature_overrides)
        return features
