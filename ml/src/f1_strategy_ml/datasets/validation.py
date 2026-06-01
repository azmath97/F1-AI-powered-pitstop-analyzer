from dataclasses import dataclass
from typing import Any

import pandas as pd


@dataclass(frozen=True)
class DatasetValidationResult:
    dataset_name: str
    status: str
    checks: list[dict[str, Any]]

    def to_dict(self) -> dict[str, Any]:
        return {"dataset_name": self.dataset_name, "status": self.status, "checks": self.checks}


class DatasetValidator:
    def validate(
        self, dataset_name: str, frame: pd.DataFrame, label_column: str
    ) -> DatasetValidationResult:
        checks: list[dict[str, Any]] = []
        checks.append(
            {
                "name": "non_empty",
                "status": "failed" if frame.empty else "passed",
                "message": "Dataset is empty." if frame.empty else "Dataset has rows.",
            }
        )
        checks.append(
            {
                "name": "label_present",
                "status": "failed" if label_column not in frame.columns else "passed",
                "message": f"Label column {label_column} present.",
            }
        )
        if label_column in frame.columns and not frame.empty:
            null_labels = int(frame[label_column].isna().sum())
            checks.append(
                {
                    "name": "label_not_null",
                    "status": "failed" if null_labels else "passed",
                    "message": f"{null_labels} null labels.",
                }
            )
        duplicate_rows = int(frame.duplicated().sum()) if not frame.empty else 0
        checks.append(
            {
                "name": "duplicate_rows",
                "status": "warning" if duplicate_rows else "passed",
                "message": f"{duplicate_rows} duplicate rows.",
            }
        )
        status = (
            "failed"
            if any(check["status"] == "failed" for check in checks)
            else "warning"
            if any(check["status"] == "warning" for check in checks)
            else "passed"
        )
        return DatasetValidationResult(dataset_name, status, checks)
