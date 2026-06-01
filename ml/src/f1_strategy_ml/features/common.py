import numpy as np
import pandas as pd

COMPOUND_ORDER = {
    "soft": 5,
    "medium": 4,
    "hard": 3,
    "intermediate": 2,
    "wet": 1,
    "unknown": 0,
}


def normalize_compound(value: object) -> str:
    if value is None or pd.isna(value):
        return "unknown"
    value_text = str(value).lower()
    return value_text if value_text in COMPOUND_ORDER else "unknown"


def add_race_time(laps: pd.DataFrame) -> pd.DataFrame:
    frame = laps.copy()
    frame["lap_time_ms_clean"] = pd.to_numeric(frame["lap_time_ms"], errors="coerce")
    frame["lap_time_ms_clean"] = frame.groupby("session_id")["lap_time_ms_clean"].transform(
        lambda series: series.fillna(series.median())
    )
    frame = frame.sort_values(["session_id", "driver_id", "lap_number"])
    frame["race_time_ms"] = frame.groupby(["session_id", "driver_id"])["lap_time_ms_clean"].cumsum()
    return frame


def rolling_pace(
    laps: pd.DataFrame,
    session_id: object,
    driver_id: object,
    lap_number: int,
    window: int = 3,
) -> float | None:
    subset = laps[
        (laps["session_id"] == session_id)
        & (laps["driver_id"] == driver_id)
        & (laps["lap_number"] < lap_number)
        & (laps["lap_number"] >= lap_number - window)
    ]
    values = pd.to_numeric(subset["lap_time_ms"], errors="coerce").dropna()
    if values.empty:
        return None
    return float(values.mean())


def pace_trend(
    laps: pd.DataFrame,
    session_id: object,
    driver_id: object,
    lap_number: int,
    window: int = 5,
) -> float:
    subset = laps[
        (laps["session_id"] == session_id)
        & (laps["driver_id"] == driver_id)
        & (laps["lap_number"] < lap_number)
        & (laps["lap_number"] >= lap_number - window)
    ].dropna(subset=["lap_time_ms"])
    if len(subset) < 3:
        return 0.0
    x = subset["lap_number"].astype(float).to_numpy()
    y = subset["lap_time_ms"].astype(float).to_numpy()
    return float(np.polyfit(x, y, 1)[0])


def position_at(
    laps: pd.DataFrame, session_id: object, driver_id: object, lap_number: int
) -> int | None:
    row = laps[
        (laps["session_id"] == session_id)
        & (laps["driver_id"] == driver_id)
        & (laps["lap_number"] == lap_number)
    ]
    if row.empty or pd.isna(row.iloc[0]["position"]):
        return None
    return int(row.iloc[0]["position"])


def race_time_at(
    laps: pd.DataFrame, session_id: object, driver_id: object, lap_number: int
) -> float | None:
    row = laps[
        (laps["session_id"] == session_id)
        & (laps["driver_id"] == driver_id)
        & (laps["lap_number"] == lap_number)
    ]
    if row.empty or pd.isna(row.iloc[0]["race_time_ms"]):
        return None
    return float(row.iloc[0]["race_time_ms"])


def traffic_score(
    laps: pd.DataFrame, session_id: object, driver_id: object, lap_number: int, band_ms: int = 2500
) -> float:
    own_time = race_time_at(laps, session_id, driver_id, lap_number)
    if own_time is None:
        return 0.0
    same_lap = laps[(laps["session_id"] == session_id) & (laps["lap_number"] == lap_number)]
    if same_lap.empty:
        return 0.0
    nearby = (same_lap["race_time_ms"].astype(float) - own_time).abs() <= band_ms
    nearby_count = int(nearby.sum()) - 1
    return float(max(0, nearby_count) / max(1, len(same_lap) - 1))


def compound_advantage(candidate: object, target: object) -> int:
    return COMPOUND_ORDER.get(normalize_compound(candidate), 0) - COMPOUND_ORDER.get(
        normalize_compound(target), 0
    )
