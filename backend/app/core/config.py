from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = "F1 Strategy Intelligence Engine"
    api_version: str = "0.1.0"
    api_v1_prefix: str = "/api/v1"
    app_env: str = Field(default="local", validation_alias="APP_ENV")
    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")
    database_url: str = Field(
        default="postgresql+asyncpg://f1_app:f1_app_password@localhost:5432/f1_strategy",
        validation_alias="DATABASE_URL",
    )
    backend_cors_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        validation_alias="BACKEND_CORS_ORIGINS",
    )
    supabase_url: str | None = Field(default=None, validation_alias="SUPABASE_URL")
    supabase_service_role_key: str | None = Field(
        default=None,
        validation_alias="SUPABASE_SERVICE_ROLE_KEY",
    )
    mlflow_tracking_uri: str = Field(
        default="http://localhost:5000",
        validation_alias="MLFLOW_TRACKING_URI",
    )
    fastf1_cache_dir: str = Field(default=".cache/fastf1", validation_alias="FASTF1_CACHE_DIR")
    openf1_base_url: str = Field(
        default="https://api.openf1.org/v1", validation_alias="OPENF1_BASE_URL"
    )
    etl_start_year: int = Field(default=2018, validation_alias="ETL_START_YEAR")
    etl_end_year: int = Field(default=2026, validation_alias="ETL_END_YEAR")
    etl_batch_size: int = Field(default=1000, validation_alias="ETL_BATCH_SIZE")
    etl_max_retries: int = Field(default=3, validation_alias="ETL_MAX_RETRIES")
    etl_telemetry_enabled: bool = Field(default=True, validation_alias="ETL_TELEMETRY_ENABLED")
    etl_report_dir: str = Field(default="datasets/reports", validation_alias="ETL_REPORT_DIR")
    dataset_output_dir: str = Field(
        default="datasets/processed", validation_alias="DATASET_OUTPUT_DIR"
    )
    model_artifact_dir: str = Field(default="ml/artifacts", validation_alias="MODEL_ARTIFACT_DIR")
    model_registry_stage: str = Field(
        default="Development", validation_alias="MODEL_REGISTRY_STAGE"
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
