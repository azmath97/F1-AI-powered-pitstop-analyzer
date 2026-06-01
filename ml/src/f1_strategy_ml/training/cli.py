import argparse
from pathlib import Path

from f1_strategy_ml.modeling.config import MODEL_SPECS, TrainingConfig
from f1_strategy_ml.training.pipeline import ModelTrainingPipeline


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Train F1 strategy ML models.")
    parser.add_argument(
        "--model",
        choices=["all", *MODEL_SPECS.keys()],
        default="all",
    )
    parser.add_argument("--dataset-dir", default="datasets/processed")
    parser.add_argument("--artifact-dir", default="ml/artifacts")
    parser.add_argument("--report-dir", default="datasets/reports/modeling")
    parser.add_argument("--mlflow-tracking-uri", default="http://localhost:5000")
    parser.add_argument("--experiment-name", default="f1-strategy-intelligence")
    parser.add_argument("--cv-folds", type=int, default=5)
    parser.add_argument("--n-iter", type=int, default=20)
    parser.add_argument("--stage", default="Development")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    config = TrainingConfig(
        dataset_dir=Path(args.dataset_dir),
        artifact_dir=Path(args.artifact_dir),
        report_dir=Path(args.report_dir),
        mlflow_tracking_uri=args.mlflow_tracking_uri,
        experiment_name=args.experiment_name,
        cv_folds=args.cv_folds,
        n_iter=args.n_iter,
        registry_stage=args.stage,
    )
    pipeline = ModelTrainingPipeline(config)
    specs = MODEL_SPECS.values() if args.model == "all" else [MODEL_SPECS[args.model]]
    for spec in specs:
        metadata = pipeline.train(spec)
        print(f"registered {metadata.model_name} {metadata.version} at {metadata.artifact_path}")


if __name__ == "__main__":
    main()
