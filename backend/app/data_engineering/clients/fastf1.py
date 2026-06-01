from pathlib import Path
from typing import Any

import pandas as pd


class FastF1Client:
    def __init__(self, cache_dir: Path, max_retries: int = 3) -> None:
        self.cache_dir = cache_dir
        self.max_retries = max_retries

    def _fastf1(self) -> Any:
        try:
            import fastf1
        except ImportError as exc:
            raise RuntimeError("fastf1 is required for historical 2018+ ingestion.") from exc
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        fastf1.Cache.enable_cache(str(self.cache_dir))
        return fastf1

    def event_schedule(self, year: int) -> pd.DataFrame:
        fastf1 = self._fastf1()
        return fastf1.get_event_schedule(year, include_testing=False)

    def load_session(
        self, year: int, round_number: int, session_code: str, telemetry: bool = True
    ) -> Any:
        fastf1 = self._fastf1()
        session = fastf1.get_session(year, round_number, session_code)
        session.load(laps=True, telemetry=telemetry, weather=True, messages=True)
        return session
