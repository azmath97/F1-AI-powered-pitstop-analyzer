from typing import Any

import pandas as pd

from app.data_engineering.records import SessionExtract
from app.data_engineering.validation import (
    SessionExtractValidator,
    ValidationCheck,
    ValidationReport,
)


class DataQualityChecker:
    def __init__(self) -> None:
        self.extract_validator = SessionExtractValidator()

    def check_extract(self, extract: SessionExtract) -> list[ValidationReport]:
        reports = self.extract_validator.validate_all(
            {
                "drivers": extract.drivers,
                "laps": extract.laps,
                "telemetry": extract.telemetry,
                "weather": extract.weather,
                "stints": extract.stints,
                "pit_stops": extract.pit_stops,
            }
        )
        reports.append(self._lap_sector_consistency(extract.laps))
        reports.append(self._session_completeness(extract))
        return reports

    @staticmethod
    def aggregate_status(reports: list[ValidationReport]) -> str:
        if any(report.status == "failed" for report in reports):
            return "failed"
        if any(report.status == "warning" for report in reports):
            return "warning"
        return "passed"

    @staticmethod
    def as_dict(reports: list[ValidationReport]) -> dict[str, Any]:
        return {
            "status": DataQualityChecker.aggregate_status(reports),
            "reports": [report.to_dict() for report in reports],
        }

    @staticmethod
    def _lap_sector_consistency(laps: pd.DataFrame) -> ValidationReport:
        if laps.empty:
            return ValidationReport(
                dataset_name="lap_sector_consistency",
                total_rows=0,
                checks=[ValidationCheck("sector_sum", "warning", "No laps available.")],
            )
        required = {"lap_time_ms", "sector_1_ms", "sector_2_ms", "sector_3_ms"}
        if not required.issubset(laps.columns):
            return ValidationReport(
                dataset_name="lap_sector_consistency",
                total_rows=len(laps),
                checks=[ValidationCheck("sector_sum", "warning", "Sector columns are incomplete.")],
            )
        clean = laps.dropna(subset=list(required)).copy()
        if clean.empty:
            failed = 0
        else:
            sector_sum = clean["sector_1_ms"] + clean["sector_2_ms"] + clean["sector_3_ms"]
            failed = int((abs(sector_sum - clean["lap_time_ms"]) > 2500).sum())
        return ValidationReport(
            dataset_name="lap_sector_consistency",
            total_rows=len(laps),
            checks=[
                ValidationCheck(
                    "sector_sum",
                    "warning" if failed else "passed",
                    f"{failed} laps have sector sums more than 2.5s away from lap time.",
                    failed,
                )
            ],
        )

    @staticmethod
    def _session_completeness(extract: SessionExtract) -> ValidationReport:
        checks = [
            ValidationCheck(
                "has_laps",
                "failed" if extract.laps.empty else "passed",
                "Lap data is required for every session.",
                1 if extract.laps.empty else 0,
            ),
            ValidationCheck(
                "has_weather",
                "warning" if extract.weather.empty else "passed",
                "Weather is missing." if extract.weather.empty else "Weather is present.",
                0,
            ),
            ValidationCheck(
                "has_tyre_data",
                "warning"
                if extract.laps.empty
                or extract.laps.get("compound", pd.Series(dtype=str)).eq("unknown").all()
                else "passed",
                "Tyre compound data is missing or unknown.",
                0,
            ),
        ]
        return ValidationReport("session_completeness", extract.extracted_rows, checks)
