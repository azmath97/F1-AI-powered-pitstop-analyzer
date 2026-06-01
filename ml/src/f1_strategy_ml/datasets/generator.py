import json
from pathlib import Path
from typing import Any

import asyncpg
import pandas as pd

from f1_strategy_ml.data_access import PostgresDataReader, asyncpg_dsn
from f1_strategy_ml.datasets.profiling import dataset_statistics, profile_dataframe
from f1_strategy_ml.datasets.validation import DatasetValidator
from f1_strategy_ml.features.overcut import OvercutFeatureBuilder
from f1_strategy_ml.features.tyre_degradation import TyreDegradationFeatureBuilder
from f1_strategy_ml.features.undercut import UndercutFeatureBuilder


class DatasetGenerator:
    def __init__(self, database_url: str, output_dir: Path, report_dir: Path | None = None) -> None:
        self.database_url = database_url
        self.output_dir = output_dir
        self.report_dir = report_dir or output_dir / "reports"
        self.reader = PostgresDataReader(database_url)
        self.validator = DatasetValidator()

    async def build_all(self) -> dict[str, Path]:
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.report_dir.mkdir(parents=True, exist_ok=True)
        tables = await self.reader.load_feature_tables()

        datasets = {
            "tyre_dataset": (
                TyreDegradationFeatureBuilder().build(tables["laps"], tables["weather"]),
                "tyre_degradation_label_ms",
                self.output_dir / "tyre_dataset.parquet",
            ),
            "undercut_dataset": (
                UndercutFeatureBuilder().build(tables["laps"], tables["pit_stops"]),
                "undercut_success_label",
                self.output_dir / "undercut_dataset.parquet",
            ),
            "overcut_dataset": (
                OvercutFeatureBuilder().build(tables["laps"], tables["pit_stops"]),
                "overcut_success_label",
                self.output_dir / "overcut_dataset.parquet",
            ),
        }

        artifacts: dict[str, Path] = {}
        for name, (frame, label_column, path) in datasets.items():
            self._write_dataset(name, frame, label_column, path)
            await self._save_artifact_metadata(name, frame, label_column, path)
            artifacts[name] = path
        return artifacts

    def _write_dataset(self, name: str, frame: pd.DataFrame, label_column: str, path: Path) -> None:
        frame.to_parquet(path, index=False)
        stats = dataset_statistics(frame, label_column=label_column)
        profile = profile_dataframe(frame)
        validation = self.validator.validate(name, frame, label_column)
        (self.report_dir / f"{name}_statistics.json").write_text(
            json.dumps(stats, indent=2, default=str),
            encoding="utf-8",
        )
        (self.report_dir / f"{name}_profile.json").write_text(
            json.dumps(profile, indent=2, default=str),
            encoding="utf-8",
        )
        (self.report_dir / f"{name}_validation.json").write_text(
            json.dumps(validation.to_dict(), indent=2, default=str),
            encoding="utf-8",
        )

    async def _save_artifact_metadata(
        self,
        name: str,
        frame: pd.DataFrame,
        label_column: str,
        path: Path,
    ) -> None:
        connection = await asyncpg.connect(asyncpg_dsn(self.database_url))
        try:
            await connection.execute(
                """
                insert into public.dataset_artifacts (
                  dataset_name,
                  artifact_path,
                  row_count,
                  column_count,
                  label_column,
                  statistics,
                  profile
                )
                values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)
                on conflict (dataset_name, artifact_path) do update
                set row_count = excluded.row_count,
                    column_count = excluded.column_count,
                    statistics = excluded.statistics,
                    profile = excluded.profile,
                    created_at = now()
                """,
                name,
                str(path),
                len(frame),
                len(frame.columns),
                label_column,
                self._json(dataset_statistics(frame, label_column=label_column)),
                self._json(profile_dataframe(frame)),
            )
        finally:
            await connection.close()

    @staticmethod
    def _json(value: dict[str, Any]) -> str:
        return json.dumps(value, default=str)
