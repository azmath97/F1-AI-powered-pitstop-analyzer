from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

from app.core.config import get_settings

SESSION_GROUPS: dict[str, tuple[str, ...]] = {
    "practice": ("FP1", "FP2", "FP3"),
    "qualifying": ("Q",),
    "sprint": ("SQ", "S"),
    "race": ("R",),
}


@dataclass(frozen=True)
class ETLConfig:
    start_year: int = 2018
    end_year: int = datetime.now().year
    session_groups: tuple[str, ...] = ("practice", "qualifying", "sprint", "race")
    batch_size: int = 1000
    max_retries: int = 3
    telemetry_enabled: bool = True
    fastf1_cache_dir: Path = Path(".cache/fastf1")
    openf1_base_url: str = "https://api.openf1.org/v1"
    report_dir: Path = Path("datasets/reports")
    dataset_output_dir: Path = Path("datasets/processed")
    openf1_min_year: int = 2023
    request_timeout_seconds: float = 45.0
    telemetry_sample_limit: int | None = None
    metadata: dict[str, str] = field(default_factory=dict)

    @property
    def session_codes(self) -> tuple[str, ...]:
        codes: list[str] = []
        for group in self.session_groups:
            codes.extend(SESSION_GROUPS[group])
        return tuple(dict.fromkeys(codes))


def etl_config_from_env() -> ETLConfig:
    settings = get_settings()
    return ETLConfig(
        start_year=int(getattr(settings, "etl_start_year", 2018)),
        end_year=int(getattr(settings, "etl_end_year", datetime.now().year)),
        batch_size=int(getattr(settings, "etl_batch_size", 1000)),
        max_retries=int(getattr(settings, "etl_max_retries", 3)),
        telemetry_enabled=str(getattr(settings, "etl_telemetry_enabled", "true")).lower() == "true",
        fastf1_cache_dir=Path(str(getattr(settings, "fastf1_cache_dir", ".cache/fastf1"))),
        openf1_base_url=str(getattr(settings, "openf1_base_url", "https://api.openf1.org/v1")),
        report_dir=Path(str(getattr(settings, "etl_report_dir", "datasets/reports"))),
        dataset_output_dir=Path(str(getattr(settings, "dataset_output_dir", "datasets/processed"))),
    )
