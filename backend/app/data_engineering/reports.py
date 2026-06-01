import json
from pathlib import Path
from typing import Any

import pandas as pd

from app.data_engineering.validation import ValidationReport


class ReportWriter:
    def __init__(self, output_dir: Path) -> None:
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def write_validation_report(
        self,
        name: str,
        reports: list[ValidationReport],
        metadata: dict[str, Any] | None = None,
    ) -> Path:
        payload = {
            "name": name,
            "metadata": metadata or {},
            "reports": [report.to_dict() for report in reports],
        }
        path = self.output_dir / f"{name}_validation.json"
        path.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")
        return path

    def write_profile(self, name: str, frame: pd.DataFrame) -> Path:
        payload = profile_dataframe(frame)
        path = self.output_dir / f"{name}_profile.json"
        path.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")
        return path


def profile_dataframe(frame: pd.DataFrame) -> dict[str, Any]:
    profile: dict[str, Any] = {
        "row_count": int(len(frame)),
        "column_count": int(len(frame.columns)),
        "columns": {},
    }
    for column in frame.columns:
        series = frame[column]
        column_profile: dict[str, Any] = {
            "dtype": str(series.dtype),
            "null_count": int(series.isna().sum()),
            "null_pct": float(series.isna().mean()) if len(series) else 0.0,
            "unique_count": int(series.nunique(dropna=True)),
        }
        if pd.api.types.is_numeric_dtype(series):
            numeric = pd.to_numeric(series, errors="coerce")
            column_profile.update(
                {
                    "min": float(numeric.min()) if numeric.notna().any() else None,
                    "max": float(numeric.max()) if numeric.notna().any() else None,
                    "mean": float(numeric.mean()) if numeric.notna().any() else None,
                    "std": float(numeric.std()) if numeric.notna().sum() > 1 else None,
                }
            )
        profile["columns"][column] = column_profile
    return profile
