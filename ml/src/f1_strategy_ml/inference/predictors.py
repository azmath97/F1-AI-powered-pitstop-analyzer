from pathlib import Path
from typing import Any

import pandas as pd

from f1_strategy_ml.modeling.registry import LocalModelRegistry, ModelMetadata


class RegisteredModelPredictor:
    def __init__(self, artifact_dir: Path, stage: str | None = None) -> None:
        self.registry = LocalModelRegistry(artifact_dir)
        self.stage = stage
        self._cache: dict[str, tuple[Any, ModelMetadata]] = {}

    def predict_regression(self, model_name: str, features: dict[str, Any]) -> dict[str, Any]:
        model, metadata = self._load(model_name)
        frame = self._frame(features, metadata.feature_columns)
        prediction = float(model.predict(frame)[0])
        return {
            "model_name": metadata.model_name,
            "model_version": metadata.version,
            "prediction": prediction,
            "confidence": self._confidence(metadata),
            "feature_snapshot": frame.iloc[0].to_dict(),
        }

    def predict_probability(self, model_name: str, features: dict[str, Any]) -> dict[str, Any]:
        model, metadata = self._load(model_name)
        frame = self._frame(features, metadata.feature_columns)
        probability = float(model.predict_proba(frame)[0][1])
        return {
            "model_name": metadata.model_name,
            "model_version": metadata.version,
            "probability": probability,
            "confidence": self._confidence(metadata),
            "feature_snapshot": frame.iloc[0].to_dict(),
        }

    def _load(self, model_name: str) -> tuple[Any, ModelMetadata]:
        cache_key = f"{model_name}:{self.stage or 'latest'}"
        if cache_key not in self._cache:
            self._cache[cache_key] = self.registry.load(model_name, stage=self.stage)
        return self._cache[cache_key]

    @staticmethod
    def _frame(features: dict[str, Any], feature_columns: list[str]) -> pd.DataFrame:
        return pd.DataFrame([{column: features.get(column) for column in feature_columns}])

    @staticmethod
    def _confidence(metadata: ModelMetadata) -> float:
        if metadata.task == "regression":
            r2 = metadata.metrics.get("r2", 0.0)
            return float(max(0.0, min(1.0, r2)))
        brier = metadata.metrics.get("brier_score", 0.25)
        return float(max(0.0, min(1.0, 1.0 - brier * 2.0)))
