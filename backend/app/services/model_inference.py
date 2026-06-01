from pathlib import Path
from typing import Any

from app.core.config import get_settings
from f1_strategy_ml.inference import RegisteredModelPredictor
from f1_strategy_ml.modeling.config import (
    OVERCUT_MODEL_SPEC,
    TYRE_MODEL_SPEC,
    UNDERCUT_MODEL_SPEC,
)


class ModelInferenceService:
    def __init__(self) -> None:
        settings = get_settings()
        self.predictor = RegisteredModelPredictor(
            artifact_dir=Path(settings.model_artifact_dir),
            stage=settings.model_registry_stage,
        )

    def predict_tyre_remaining_laps(self, features: dict[str, Any]) -> dict[str, Any]:
        return self.predictor.predict_regression(TYRE_MODEL_SPEC.name, features)

    def predict_undercut_success(self, features: dict[str, Any]) -> dict[str, Any]:
        return self.predictor.predict_probability(UNDERCUT_MODEL_SPEC.name, features)

    def predict_overcut_success(self, features: dict[str, Any]) -> dict[str, Any]:
        return self.predictor.predict_probability(OVERCUT_MODEL_SPEC.name, features)


def request_features(base: dict[str, Any], overrides: dict[str, Any]) -> dict[str, Any]:
    features = dict(base)
    features.update(overrides)
    return features
