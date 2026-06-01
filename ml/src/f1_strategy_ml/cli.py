import argparse
import asyncio
from pathlib import Path

from f1_strategy_ml.datasets.generator import DatasetGenerator


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Build F1 strategy ML datasets.")
    parser.add_argument(
        "--database-url",
        default="postgresql+asyncpg://f1_app:f1_app_password@localhost:5432/f1_strategy",
    )
    parser.add_argument("--output-dir", default="datasets/processed")
    parser.add_argument("--report-dir", default="datasets/reports")
    return parser


async def run(args: argparse.Namespace) -> dict[str, str]:
    generator = DatasetGenerator(
        database_url=args.database_url,
        output_dir=Path(args.output_dir),
        report_dir=Path(args.report_dir),
    )
    artifacts = await generator.build_all()
    return {name: str(path) for name, path in artifacts.items()}


def main() -> None:
    args = build_parser().parse_args()
    artifacts = asyncio.run(run(args))
    print(artifacts)


if __name__ == "__main__":
    main()
