from pathlib import Path

from f1_strategy_ml.modeling.registry import LocalModelRegistry, ModelMetadata


class DummyRegressionModel:
    def predict(self, frame):
        return [float(frame["x"].iloc[0]) + 1.0]


def test_local_model_registry_round_trip(tmp_path: Path) -> None:
    registry = LocalModelRegistry(tmp_path)
    metadata = ModelMetadata(
        model_name="dummy",
        algorithm="test",
        task="regression",
        version="v1",
        stage="Development",
        artifact_path="",
        feature_columns=["x"],
        target_column="y",
        metrics={"r2": 0.8},
        created_at="2026-01-01T00:00:00Z",
    )

    registry.register(DummyRegressionModel(), metadata)
    model, loaded_metadata = registry.load("dummy", stage="Development")

    assert loaded_metadata.model_name == "dummy"
    assert model.predict(__import__("pandas").DataFrame([{"x": 2}]))[0] == 3.0
