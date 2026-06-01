from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ModelPrediction:
    model_name: str
    model_version: str
    probability: float
    confidence: float
    feature_snapshot: dict[str, Any]
    shap_values: dict[str, float]
