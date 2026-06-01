from dataclasses import dataclass


@dataclass(frozen=True)
class ShapContribution:
    feature_name: str
    contribution: float
