from collections.abc import Iterable
from typing import Any

import structlog

from app.core.config import get_settings
from app.data_engineering.clients.fastf1 import FastF1Client
from app.data_engineering.clients.openf1 import OpenF1Client
from app.data_engineering.config import ETLConfig
from app.data_engineering.database import PostgresConnectionFactory
from app.data_engineering.extractors.fastf1 import FastF1Extractor
from app.data_engineering.extractors.openf1 import OpenF1Extractor
from app.data_engineering.quality import DataQualityChecker
from app.data_engineering.records import SessionExtract
from app.data_engineering.reports import ReportWriter
from app.data_engineering.repository import PostgresETLRepository

logger = structlog.get_logger(__name__)


class HistoricalETLPipeline:
    def __init__(self, config: ETLConfig, database_url: str | None = None) -> None:
        self.config = config
        self.database_url = database_url or get_settings().database_url
        self.connection_factory = PostgresConnectionFactory(self.database_url)
        self.quality = DataQualityChecker()
        self.report_writer = ReportWriter(config.report_dir)

    async def run(self, sources: Iterable[str] = ("fastf1", "openf1")) -> dict[str, Any]:
        summary = {"sources": list(sources), "sessions": 0, "loaded_rows": 0, "failed_sessions": 0}
        connection = await self.connection_factory.connect()
        try:
            repository = PostgresETLRepository(connection, batch_size=self.config.batch_size)
            for source in sources:
                if source == "fastf1":
                    result = await self._run_fastf1(repository)
                elif source == "openf1":
                    result = await self._run_openf1(repository)
                else:
                    raise ValueError(f"Unknown source: {source}")
                summary["sessions"] += result["sessions"]
                summary["loaded_rows"] += result["loaded_rows"]
                summary["failed_sessions"] += result["failed_sessions"]
        finally:
            await connection.close()
        return summary

    async def _run_fastf1(self, repository: PostgresETLRepository) -> dict[str, int]:
        client = FastF1Client(self.config.fastf1_cache_dir, max_retries=self.config.max_retries)
        extractor = FastF1Extractor(client, self.config)
        refs = extractor.iter_session_refs()
        result = {"sessions": 0, "loaded_rows": 0, "failed_sessions": 0}
        for year, round_number, session_code in refs:
            try:
                extract = extractor.extract(year, round_number, session_code)
                loaded = await self._validate_and_load(repository, extract)
                result["sessions"] += 1
                result["loaded_rows"] += loaded
            except Exception as exc:
                result["failed_sessions"] += 1
                logger.exception(
                    "fastf1_session_failed",
                    year=year,
                    round_number=round_number,
                    session_code=session_code,
                    error=str(exc),
                )
        return result

    async def _run_openf1(self, repository: PostgresETLRepository) -> dict[str, int]:
        client = OpenF1Client(
            self.config.openf1_base_url,
            timeout_seconds=self.config.request_timeout_seconds,
            max_retries=self.config.max_retries,
        )
        extractor = OpenF1Extractor(client, self.config)
        refs = await extractor.iter_session_refs()
        result = {"sessions": 0, "loaded_rows": 0, "failed_sessions": 0}
        for session_ref in refs:
            try:
                extract = await extractor.extract(session_ref)
                loaded = await self._validate_and_load(repository, extract)
                result["sessions"] += 1
                result["loaded_rows"] += loaded
            except Exception as exc:
                result["failed_sessions"] += 1
                logger.exception(
                    "openf1_session_failed",
                    session_key=session_ref.get("session_key"),
                    session_name=session_ref.get("session_name"),
                    error=str(exc),
                )
        return result

    async def _validate_and_load(
        self, repository: PostgresETLRepository, extract: SessionExtract
    ) -> int:
        run_id = await repository.start_ingestion_run(extract)
        reports = self.quality.check_extract(extract)
        self.report_writer.write_validation_report(
            name=f"{extract.source}_{extract.season}_{extract.session_key}",
            reports=reports,
            metadata=extract.metadata,
        )
        for report in reports:
            await repository.save_quality_report(
                ingestion_run_id=run_id,
                dataset_name=report.dataset_name,
                status=report.status,
                total_rows=report.total_rows,
                failed_checks=report.failed_checks,
                warning_checks=report.warning_checks,
                report=report.to_dict(),
            )
        if self.quality.aggregate_status(reports) == "failed":
            await repository.finish_ingestion_run(
                run_id,
                status="failed",
                records_extracted=extract.extracted_rows,
                records_loaded=0,
                error_message="Data validation failed.",
            )
            raise ValueError(
                f"Validation failed for {extract.source} session {extract.session_key}."
            )

        try:
            loaded = await repository.load(extract)
        except Exception as exc:
            await repository.finish_ingestion_run(
                run_id,
                status="failed",
                records_extracted=extract.extracted_rows,
                records_loaded=0,
                error_message=str(exc),
            )
            raise
        await repository.finish_ingestion_run(
            run_id,
            status="completed",
            records_extracted=extract.extracted_rows,
            records_loaded=loaded,
        )
        logger.info(
            "session_loaded",
            source=extract.source,
            season=extract.season,
            session_key=extract.session_key,
            records_extracted=extract.extracted_rows,
            records_loaded=loaded,
        )
        return loaded
