from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class TrainingConfig:
    dataset_dir: Path = Path("datasets/processed")
    artifact_dir: Path = Path("ml/artifacts")
    report_dir: Path = Path("datasets/reports/modeling")
    mlflow_tracking_uri: str = "http://localhost:5000"
    experiment_name: str = "f1-strategy-intelligence"
    random_state: int = 42
    cv_folds: int = 5
    n_iter: int = 20
    shap_sample_size: int = 250
    test_size: float = 0.2
    registry_stage: str = "Development"


@dataclass(frozen=True)
class ModelSpec:
    name: str
    algorithm: str
    dataset_file: str
    target_column: str
    task: str
    calibrated: bool = False


TYRE_MODEL_SPEC = ModelSpec(
    name="tyre_degradation_remaining_life",
    algorithm="lightgbm",
    dataset_file="tyre_dataset.parquet",
    target_column="remaining_laps_label",
    task="regression",
)

UNDERCUT_MODEL_SPEC = ModelSpec(
    name="undercut_success",
    algorithm="xgboost",
    dataset_file="undercut_dataset.parquet",
    target_column="undercut_success_label",
    task="classification",
    calibrated=True,
)

OVERCUT_MODEL_SPEC = ModelSpec(
    name="overcut_success",
    algorithm="catboost",
    dataset_file="overcut_dataset.parquet",
    target_column="overcut_success_label",
    task="classification",
    calibrated=True,
)

MODEL_SPECS = {
    TYRE_MODEL_SPEC.name: TYRE_MODEL_SPEC,
    UNDERCUT_MODEL_SPEC.name: UNDERCUT_MODEL_SPEC,
    OVERCUT_MODEL_SPEC.name: OVERCUT_MODEL_SPEC,
}
