from typing import Any

import pandas as pd


def dataset_statistics(frame: pd.DataFrame, label_column: str | None = None) -> dict[str, Any]:
    stats: dict[str, Any] = {
        "row_count": int(len(frame)),
        "column_count": int(len(frame.columns)),
        "null_counts": {column: int(frame[column].isna().sum()) for column in frame.columns},
    }
    if label_column and label_column in frame.columns:
        stats["label_distribution"] = {
            str(key): int(value)
            for key, value in frame[label_column].value_counts(dropna=False).to_dict().items()
        }
    return stats


def profile_dataframe(frame: pd.DataFrame) -> dict[str, Any]:
    profile: dict[str, Any] = {
        "row_count": int(len(frame)),
        "column_count": int(len(frame.columns)),
        "columns": {},
    }
    for column in frame.columns:
        series = frame[column]
        details: dict[str, Any] = {
            "dtype": str(series.dtype),
            "null_pct": float(series.isna().mean()) if len(series) else 0.0,
            "unique_count": int(series.nunique(dropna=True)),
        }
        if pd.api.types.is_numeric_dtype(series):
            numeric = pd.to_numeric(series, errors="coerce")
            details.update(
                {
                    "min": float(numeric.min()) if numeric.notna().any() else None,
                    "max": float(numeric.max()) if numeric.notna().any() else None,
                    "mean": float(numeric.mean()) if numeric.notna().any() else None,
                    "std": float(numeric.std()) if numeric.notna().sum() > 1 else None,
                }
            )
        profile["columns"][column] = details
    return profile
