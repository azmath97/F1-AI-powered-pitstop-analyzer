import json
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import joblib


@dataclass(frozen=True)
class ModelMetadata:
    model_name: str
    algorithm: str
    task: str
    version: str
    stage: str
    artifact_path: str
    feature_columns: list[str]
    target_column: str
    metrics: dict[str, float]
    created_at: str


class LocalModelRegistry:
    def __init__(self, artifact_dir: Path) -> None:
        self.artifact_dir = artifact_dir
        self.registry_path = artifact_dir / "registry.json"
        self.artifact_dir.mkdir(parents=True, exist_ok=True)

    def register(
        self,
        model: Any,
        metadata: ModelMetadata,
        extra_artifacts: dict[str, str] | None = None,
    ) -> ModelMetadata:
        model_dir = self.artifact_dir / metadata.model_name / metadata.version
        model_dir.mkdir(parents=True, exist_ok=True)
        model_path = model_dir / "model.joblib"
        joblib.dump(model, model_path)
        updated = ModelMetadata(
            **{
                **asdict(metadata),
                "artifact_path": str(model_path),
            }
        )
        (model_dir / "metadata.json").write_text(
            json.dumps(asdict(updated), indent=2, default=str),
            encoding="utf-8",
        )
        if extra_artifacts:
            (model_dir / "artifacts.json").write_text(
                json.dumps(extra_artifacts, indent=2, default=str),
                encoding="utf-8",
            )
        registry = self._read_registry()
        registry.setdefault(updated.model_name, []).append(asdict(updated))
        self.registry_path.write_text(json.dumps(registry, indent=2), encoding="utf-8")
        return updated

    def latest(self, model_name: str, stage: str | None = None) -> ModelMetadata:
        candidates = self._read_registry().get(model_name, [])
        if stage:
            candidates = [item for item in candidates if item["stage"] == stage]
        if not candidates:
            raise FileNotFoundError(f"No registered model found for {model_name}.")
        latest = sorted(candidates, key=lambda item: item["created_at"])[-1]
        return ModelMetadata(**latest)

    def load(self, model_name: str, stage: str | None = None) -> tuple[Any, ModelMetadata]:
        metadata = self.latest(model_name, stage=stage)
        return joblib.load(metadata.artifact_path), metadata

    def _read_registry(self) -> dict[str, list[dict[str, Any]]]:
        if not self.registry_path.exists():
            return {}
        return json.loads(self.registry_path.read_text(encoding="utf-8"))


def new_version() -> str:
    return datetime.now(UTC).strftime("%Y%m%d%H%M%S")
