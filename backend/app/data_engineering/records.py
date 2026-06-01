from dataclasses import dataclass, field
from typing import Any

import pandas as pd


@dataclass
class SessionExtract:
    source: str
    season: int
    session_name: str
    session_key: int | None
    meeting_key: int | None
    circuit: dict[str, Any]
    session: dict[str, Any]
    teams: pd.DataFrame = field(default_factory=pd.DataFrame)
    drivers: pd.DataFrame = field(default_factory=pd.DataFrame)
    laps: pd.DataFrame = field(default_factory=pd.DataFrame)
    telemetry: pd.DataFrame = field(default_factory=pd.DataFrame)
    weather: pd.DataFrame = field(default_factory=pd.DataFrame)
    stints: pd.DataFrame = field(default_factory=pd.DataFrame)
    pit_stops: pd.DataFrame = field(default_factory=pd.DataFrame)
    positions: pd.DataFrame = field(default_factory=pd.DataFrame)
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def extracted_rows(self) -> int:
        frames = (
            self.teams,
            self.drivers,
            self.laps,
            self.telemetry,
            self.weather,
            self.stints,
            self.pit_stops,
            self.positions,
        )
        return sum(len(frame) for frame in frames if not frame.empty)
