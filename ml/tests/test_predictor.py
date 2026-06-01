from pathlib import Path

from f1_strategy_ml.inference import RegisteredModelPredictor
from f1_strategy_ml.modeling.registry import LocalModelRegistry, ModelMetadata


class DummyClassifier:
    def predict_proba(self, frame):
        _ = frame
        return [[0.3, 0.7]]


def test_registered_model_predictor_probability(tmp_path: Path) -> None:
    registry = LocalModelRegistry(tmp_path)
    registry.register(
        DummyClassifier(),
        ModelMetadata(
            model_name="undercut_success",
            algorithm="test",
            task="classification",
            version="v1",
            stage="Development",
            artifact_path="",
            feature_columns=["gap_ms"],
            target_column="label",
            metrics={"brier_score": 0.1},
            created_at="2026-01-01T00:00:00Z",
        ),
    )

    predictor = RegisteredModelPredictor(tmp_path, stage="Development")
    result = predictor.predict_probability("undercut_success", {"gap_ms": 1200})

    assert result["probability"] == 0.7
    assert result["confidence"] == 0.8
