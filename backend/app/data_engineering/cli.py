import argparse
import asyncio
from pathlib import Path

from app.core.logging import configure_logging
from app.data_engineering.config import ETLConfig
from app.data_engineering.pipeline import HistoricalETLPipeline


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="F1 historical ETL pipeline")
    parser.add_argument("--source", choices=["fastf1", "openf1", "both"], default="both")
    parser.add_argument("--start-year", type=int, default=2018)
    parser.add_argument("--end-year", type=int, default=2026)
    parser.add_argument(
        "--sessions", nargs="+", default=["practice", "qualifying", "sprint", "race"]
    )
    parser.add_argument("--batch-size", type=int, default=1000)
    parser.add_argument("--max-retries", type=int, default=3)
    parser.add_argument("--no-telemetry", action="store_true")
    parser.add_argument("--telemetry-sample-limit", type=int)
    parser.add_argument("--fastf1-cache-dir", default=".cache/fastf1")
    parser.add_argument("--report-dir", default="datasets/reports")
    parser.add_argument("--openf1-base-url", default="https://api.openf1.org/v1")
    return parser


async def run_from_args(args: argparse.Namespace) -> dict[str, object]:
    config = ETLConfig(
        start_year=args.start_year,
        end_year=args.end_year,
        session_groups=tuple(args.sessions),
        batch_size=args.batch_size,
        max_retries=args.max_retries,
        telemetry_enabled=not args.no_telemetry,
        telemetry_sample_limit=args.telemetry_sample_limit,
        fastf1_cache_dir=Path(args.fastf1_cache_dir),
        report_dir=Path(args.report_dir),
        openf1_base_url=args.openf1_base_url,
    )
    sources = ("fastf1", "openf1") if args.source == "both" else (args.source,)
    pipeline = HistoricalETLPipeline(config)
    return await pipeline.run(sources=sources)


def main() -> None:
    configure_logging("INFO")
    args = build_parser().parse_args()
    summary = asyncio.run(run_from_args(args))
    print(summary)


if __name__ == "__main__":
    main()
