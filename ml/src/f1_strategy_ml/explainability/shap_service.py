import json
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd


class ShapExplainer:
    def __init__(self, sample_size: int = 250, random_state: int = 42) -> None:
        self.sample_size = sample_size
        self.random_state = random_state

    def explain_model(
        self,
        model: Any,
        features: pd.DataFrame,
        output_path: Path,
        task: str,
    ) -> dict[str, float]:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        sample = features.sample(
            n=min(self.sample_size, len(features)),
            random_state=self.random_state,
        )
        try:
            import shap

            predict_fn = (
                model.predict
                if task == "regression"
                else lambda data: model.predict_proba(data)[:, 1]
            )
            explainer = shap.Explainer(predict_fn, sample)
            values = explainer(sample)
            raw_values = values.values
            if raw_values.ndim > 2:
                raw_values = raw_values[:, :, -1]
            importance = np.abs(raw_values).mean(axis=0)
            result = {
                column: float(score)
                for column, score in zip(sample.columns, importance, strict=False)
            }
            payload = {
                "status": "generated",
                "feature_importance": result,
                "sample_size": len(sample),
            }
        except Exception as exc:
            result = {}
            payload = {
                "status": "failed",
                "reason": str(exc),
                "sample_size": len(sample),
            }
        output_path.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")
        return result
