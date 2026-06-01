import pandas as pd

from app.data_engineering.quality import DataQualityChecker
from app.data_engineering.records import SessionExtract


def test_quality_checker_warns_on_sector_mismatch() -> None:
    extract = SessionExtract(
        source="fastf1",
        season=2024,
        session_name="Race",
        session_key=20240107,
        meeting_key=None,
        circuit={"name": "Test", "country": "UK"},
        session={"session_key": 20240107},
        drivers=pd.DataFrame(
            {"driver_number": [1], "code": ["VER"], "full_name": ["Max Verstappen"]}
        ),
        laps=pd.DataFrame(
            {
                "driver_number": [1],
                "lap_number": [1],
                "lap_time_ms": [90000],
                "sector_1_ms": [10000],
                "sector_2_ms": [10000],
                "sector_3_ms": [10000],
                "compound": ["medium"],
                "tyre_age_laps": [1],
            }
        ),
    )

    reports = DataQualityChecker().check_extract(extract)

    assert any(
        report.dataset_name == "lap_sector_consistency" and report.status == "warning"
        for report in reports
    )
