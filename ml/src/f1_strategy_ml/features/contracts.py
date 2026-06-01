from dataclasses import dataclass
from typing import Any
from uuid import UUID


@dataclass(frozen=True)
class FeatureRequest:
    session_id: UUID
    driver_id: UUID
    lap_number: int
    overrides: dict[str, Any]
