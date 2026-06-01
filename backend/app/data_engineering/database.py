from typing import Any

import asyncpg
import pandas as pd


def asyncpg_dsn(database_url: str) -> str:
    return database_url.replace("postgresql+asyncpg://", "postgresql://", 1)


def clean_value(value: Any) -> Any:
    if value is pd.NA:
        return None
    if value is None:
        return None
    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass
    if isinstance(value, pd.Timestamp):
        return value.to_pydatetime()
    return value


def records(frame: pd.DataFrame) -> list[dict[str, Any]]:
    if frame.empty:
        return []
    return [
        {key: clean_value(value) for key, value in row.items()} for row in frame.to_dict("records")
    ]


class PostgresConnectionFactory:
    def __init__(self, database_url: str) -> None:
        self.database_url = asyncpg_dsn(database_url)

    async def connect(self) -> asyncpg.Connection:
        return await asyncpg.connect(self.database_url)
