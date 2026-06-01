from dataclasses import dataclass
from typing import Any

import pandas as pd


@dataclass(frozen=True)
class ValidationCheck:
    name: str
    status: str
    message: str
    failed_rows: int = 0


@dataclass(frozen=True)
class ValidationReport:
    dataset_name: str
    total_rows: int
    checks: list[ValidationCheck]

    @property
    def status(self) -> str:
        if any(check.status == "failed" for check in self.checks):
            return "failed"
        if any(check.status == "warning" for check in self.checks):
            return "warning"
        return "passed"

    @property
    def failed_checks(self) -> int:
        return sum(1 for check in self.checks if check.status == "failed")

    @property
    def warning_checks(self) -> int:
        return sum(1 for check in self.checks if check.status == "warning")

    def to_dict(self) -> dict[str, Any]:
        return {
            "dataset_name": self.dataset_name,
            "status": self.status,
            "total_rows": self.total_rows,
            "failed_checks": self.failed_checks,
            "warning_checks": self.warning_checks,
            "checks": [check.__dict__ for check in self.checks],
        }


class DataFrameValidator:
    def validate(
        self,
        dataset_name: str,
        frame: pd.DataFrame,
        required_columns: set[str],
        unique_columns: list[str] | None = None,
        ranges: dict[str, tuple[float | None, float | None]] | None = None,
    ) -> ValidationReport:
        checks: list[ValidationCheck] = []
        missing = sorted(required_columns.difference(frame.columns))
        checks.append(
            ValidationCheck(
                name="required_columns",
                status="failed" if missing else "passed",
                message=f"Missing columns: {missing}"
                if missing
                else "All required columns are present.",
                failed_rows=len(frame) if missing else 0,
            )
        )
        if frame.empty:
            checks.append(
                ValidationCheck(
                    name="non_empty",
                    status="warning",
                    message="Dataset is empty.",
                    failed_rows=0,
                )
            )
            return ValidationReport(dataset_name=dataset_name, total_rows=0, checks=checks)

        for column in required_columns.intersection(frame.columns):
            missing_count = int(frame[column].isna().sum())
            checks.append(
                ValidationCheck(
                    name=f"{column}_not_null",
                    status="failed" if missing_count else "passed",
                    message=f"{missing_count} null values in {column}.",
                    failed_rows=missing_count,
                )
            )

        if unique_columns and set(unique_columns).issubset(frame.columns):
            duplicates = int(frame.duplicated(subset=unique_columns).sum())
            checks.append(
                ValidationCheck(
                    name="unique_key",
                    status="failed" if duplicates else "passed",
                    message=f"{duplicates} duplicate key rows for {unique_columns}.",
                    failed_rows=duplicates,
                )
            )

        for column, (minimum, maximum) in (ranges or {}).items():
            if column not in frame.columns:
                continue
            series = pd.to_numeric(frame[column], errors="coerce")
            failed = pd.Series(False, index=frame.index)
            if minimum is not None:
                failed |= series < minimum
            if maximum is not None:
                failed |= series > maximum
            failed_count = int(failed.fillna(False).sum())
            checks.append(
                ValidationCheck(
                    name=f"{column}_range",
                    status="failed" if failed_count else "passed",
                    message=f"{failed_count} values outside range {minimum}..{maximum}.",
                    failed_rows=failed_count,
                )
            )

        return ValidationReport(dataset_name=dataset_name, total_rows=len(frame), checks=checks)


class SessionExtractValidator:
    def __init__(self) -> None:
        self.validator = DataFrameValidator()

    def validate_all(self, frames: dict[str, pd.DataFrame]) -> list[ValidationReport]:
        return [
            self.validator.validate(
                "drivers",
                frames.get("drivers", pd.DataFrame()),
                {"driver_number", "code", "full_name"},
                unique_columns=["driver_number"],
            ),
            self.validator.validate(
                "laps",
                frames.get("laps", pd.DataFrame()),
                {"driver_number", "lap_number"},
                unique_columns=["driver_number", "lap_number"],
                ranges={
                    "lap_number": (1, None),
                    "lap_time_ms": (1, None),
                    "tyre_age_laps": (0, None),
                },
            ),
            self.validator.validate(
                "telemetry",
                frames.get("telemetry", pd.DataFrame()),
                {"driver_number", "sample_time"},
                ranges={"speed_kph": (0, 400), "throttle_pct": (0, 100), "brake_pct": (0, 100)},
            ),
            self.validator.validate(
                "weather",
                frames.get("weather", pd.DataFrame()),
                {"recorded_at"},
                ranges={"humidity_pct": (0, 100), "wind_direction_deg": (0, 360)},
            ),
            self.validator.validate(
                "stints",
                frames.get("stints", pd.DataFrame()),
                {"driver_number", "stint_number", "compound", "start_lap"},
                unique_columns=["driver_number", "stint_number"],
                ranges={"start_lap": (1, None), "laps_completed": (0, None)},
            ),
            self.validator.validate(
                "pit_stops",
                frames.get("pit_stops", pd.DataFrame()),
                {"driver_number", "lap_number", "stop_number"},
                unique_columns=["driver_number", "stop_number"],
                ranges={"lap_number": (1, None), "stationary_ms": (0, None)},
            ),
        ]
