from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True)
class StrategyContext:
    session_id: UUID
    driver_id: UUID
    lap_number: int
