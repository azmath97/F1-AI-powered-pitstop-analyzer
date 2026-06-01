import pandas as pd

from f1_strategy_ml.features.common import (
    add_race_time,
    position_at,
    race_time_at,
    rolling_pace,
    traffic_score,
)


class UndercutFeatureBuilder:
    def build(self, laps: pd.DataFrame, pit_stops: pd.DataFrame) -> pd.DataFrame:
        if laps.empty or pit_stops.empty:
            return pd.DataFrame()
        race_laps = add_race_time(laps)
        rows: list[dict[str, object]] = []
        for _, stop in pit_stops.iterrows():
            session_id = stop["session_id"]
            driver_id = stop["driver_id"]
            pit_lap = int(stop["lap_number"])
            before_lap = max(1, pit_lap - 1)
            before = race_laps[
                (race_laps["session_id"] == session_id)
                & (race_laps["driver_id"] == driver_id)
                & (race_laps["lap_number"] == before_lap)
            ]
            if before.empty or pd.isna(before.iloc[0]["position"]):
                continue
            before_position = int(before.iloc[0]["position"])
            target = race_laps[
                (race_laps["session_id"] == session_id)
                & (race_laps["lap_number"] == before_lap)
                & (race_laps["position"] == before_position - 1)
            ]
            if target.empty:
                continue
            target_row = target.iloc[0]
            target_driver_id = target_row["driver_id"]
            evaluation_lap = pit_lap + 5
            label = self._success_label(
                race_laps, session_id, driver_id, target_driver_id, before_position, evaluation_lap
            )
            driver_pace = rolling_pace(race_laps, session_id, driver_id, pit_lap)
            target_pace = rolling_pace(race_laps, session_id, target_driver_id, pit_lap)
            own_time = race_time_at(race_laps, session_id, driver_id, before_lap)
            target_time = race_time_at(race_laps, session_id, target_driver_id, before_lap)
            rows.append(
                {
                    "session_id": session_id,
                    "driver_id": driver_id,
                    "target_driver_id": target_driver_id,
                    "pit_lap": pit_lap,
                    "track_position": before_position,
                    "gap_ms": None
                    if own_time is None or target_time is None
                    else own_time - target_time,
                    "pace_delta_ms": None
                    if driver_pace is None or target_pace is None
                    else driver_pace - target_pace,
                    "tyre_age_delta": self._value(before, "tyre_age_laps")
                    - self._value(target, "tyre_age_laps"),
                    "traffic_score": traffic_score(race_laps, session_id, driver_id, pit_lap),
                    "pit_lane_loss_ms": self._value(before, "pit_lane_loss_ms"),
                    "undercut_success_label": label,
                }
            )
        return pd.DataFrame(rows)

    @staticmethod
    def _success_label(
        laps: pd.DataFrame,
        session_id: object,
        driver_id: object,
        target_driver_id: object,
        before_position: int,
        evaluation_lap: int,
    ) -> int:
        driver_position = position_at(laps, session_id, driver_id, evaluation_lap)
        target_position = position_at(laps, session_id, target_driver_id, evaluation_lap)
        if driver_position is None or target_position is None:
            return 0
        return int(driver_position < target_position and driver_position < before_position)

    @staticmethod
    def _value(frame: pd.DataFrame, column: str) -> float:
        if frame.empty or column not in frame.columns or pd.isna(frame.iloc[0][column]):
            return 0.0
        return float(frame.iloc[0][column])
