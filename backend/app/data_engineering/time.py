from datetime import UTC, datetime
from typing import Any

import pandas as pd


def utc_now() -> datetime:
    return datetime.now(UTC)


def to_utc_timestamp(value: Any) -> pd.Timestamp | None:
    if value is None or pd.isna(value):
        return None
    timestamp = pd.Timestamp(value)
    if timestamp.tzinfo is None:
        return timestamp.tz_localize("UTC")
    return timestamp.tz_convert("UTC")


def milliseconds(value: Any) -> int | None:
    if value is None or pd.isna(value):
        return None
    if isinstance(value, pd.Timedelta):
        return int(value.total_seconds() * 1000)
    if hasattr(value, "total_seconds"):
        return int(value.total_seconds() * 1000)
    try:
        return int(float(value) * 1000)
    except (TypeError, ValueError):
        return None


def timedelta_to_timestamp(t0: pd.Timestamp | None, value: Any) -> pd.Timestamp | None:
    if t0 is None or value is None or pd.isna(value):
        return None
    return to_utc_timestamp(t0 + pd.Timedelta(value))
