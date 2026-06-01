from typing import Any

import numpy as np
import pandas as pd


def regression_metrics(y_true: pd.Series, y_pred: np.ndarray) -> dict[str, float]:
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

    rmse = float(mean_squared_error(y_true, y_pred) ** 0.5)
    return {
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "rmse": rmse,
        "r2": float(r2_score(y_true, y_pred)),
    }


def classification_metrics(y_true: pd.Series, probabilities: np.ndarray) -> dict[str, float]:
    from sklearn.metrics import (
        accuracy_score,
        average_precision_score,
        brier_score_loss,
        log_loss,
        roc_auc_score,
    )

    positive_probability = probabilities[:, 1] if probabilities.ndim == 2 else probabilities
    predictions = (positive_probability >= 0.5).astype(int)
    metrics: dict[str, float] = {
        "accuracy": float(accuracy_score(y_true, predictions)),
        "brier_score": float(brier_score_loss(y_true, positive_probability)),
        "log_loss": float(log_loss(y_true, probabilities)),
    }
    if len(set(y_true.astype(int))) > 1:
        metrics["roc_auc"] = float(roc_auc_score(y_true, positive_probability))
        metrics["average_precision"] = float(average_precision_score(y_true, positive_probability))
    return metrics


def summarize_metrics(metrics: dict[str, Any]) -> dict[str, Any]:
    return {
        key: float(value) if isinstance(value, np.floating) else value
        for key, value in metrics.items()
    }
