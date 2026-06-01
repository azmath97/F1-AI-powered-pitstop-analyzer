import pandas as pd

from app.data_engineering.validation import DataFrameValidator


def test_dataframe_validator_detects_missing_required_column() -> None:
    frame = pd.DataFrame({"driver_number": [1], "lap_number": [1]})
    report = DataFrameValidator().validate(
        "laps", frame, {"driver_number", "lap_number", "lap_time_ms"}
    )

    assert report.status == "failed"
    assert report.failed_checks >= 1


def test_dataframe_validator_detects_duplicate_keys() -> None:
    frame = pd.DataFrame(
        {
            "driver_number": [1, 1],
            "lap_number": [10, 10],
            "lap_time_ms": [90000, 90100],
        }
    )
    report = DataFrameValidator().validate(
        "laps",
        frame,
        {"driver_number", "lap_number"},
        unique_columns=["driver_number", "lap_number"],
    )

    assert report.status == "failed"
    assert any(check.name == "unique_key" and check.failed_rows == 1 for check in report.checks)
