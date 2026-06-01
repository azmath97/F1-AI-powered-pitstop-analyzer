import pandas as pd

from f1_strategy_ml.features.common import (
    add_race_time,
    compound_advantage,
    pace_trend,
    position_at,
    race_time_at,
    rolling_pace,
    traffic_score,
)


class OvercutFeatureBuilder:
    def build(self, laps: pd.DataFrame, pit_stops: pd.DataFrame) -> pd.DataFrame:
        if laps.empty or pit_stops.empty:
            return pd.DataFrame()
        race_laps = add_race_time(laps)
        pit_stops = pit_stops.sort_values(["session_id", "lap_number"])
        rows: list[dict[str, object]] = []
        for _, later_stop in pit_stops.iterrows():
            session_id = later_stop["session_id"]
            driver_id = later_stop["driver_id"]
            pit_lap = int(later_stop["lap_number"])
            earlier_stops = pit_stops[
                (pit_stops["session_id"] == session_id)
                & (pit_stops["driver_id"] != driver_id)
                & (pit_stops["lap_number"] < pit_lap)
                & (pit_stops["lap_number"] >= pit_lap - 6)
            ]
            for _, target_stop in earlier_stops.iterrows():
                target_driver_id = target_stop["driver_id"]
                comparison_lap = max(1, int(target_stop["lap_number"]) - 1)
                driver_pos = position_at(race_laps, session_id, driver_id, comparison_lap)
                target_pos = position_at(race_laps, session_id, target_driver_id, comparison_lap)
                if driver_pos is None or target_pos is None or driver_pos <= target_pos:
                    continue
                evaluation_lap = pit_lap + 4
                label = self._success_label(
                    race_laps, session_id, driver_id, target_driver_id, driver_pos, evaluation_lap
                )
                own_time = race_time_at(race_laps, session_id, driver_id, comparison_lap)
                target_time = race_time_at(race_laps, session_id, target_driver_id, comparison_lap)
                rows.append(
                    {
                        "session_id": session_id,
                        "driver_id": driver_id,
                        "target_driver_id": target_driver_id,
                        "pit_lap": pit_lap,
                        "track_position": driver_pos,
                        "gap_ms": None
                        if own_time is None or target_time is None
                        else own_time - target_time,
                        "clean_air_score": 1.0
                        - traffic_score(race_laps, session_id, driver_id, comparison_lap),
                        "pace_trend_ms_per_lap": pace_trend(
                            race_laps, session_id, driver_id, pit_lap
                        ),
                        "pace_delta_ms": self._pace_delta(
                            race_laps, session_id, driver_id, target_driver_id, pit_lap
                        ),
                        "compound_advantage": self._compound_advantage(
                            race_laps, session_id, driver_id, target_driver_id, comparison_lap
                        ),
                        "track_degradation_ms_per_lap": self._track_degradation(
                            race_laps, session_id, comparison_lap
                        ),
                        "overcut_success_label": label,
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
    def _pace_delta(
        laps: pd.DataFrame,
        session_id: object,
        driver_id: object,
        target_driver_id: object,
        lap_number: int,
    ) -> float | None:
        driver_pace = rolling_pace(laps, session_id, driver_id, lap_number)
        target_pace = rolling_pace(laps, session_id, target_driver_id, lap_number)
        if driver_pace is None or target_pace is None:
            return None
        return driver_pace - target_pace

    @staticmethod
    def _compound_advantage(
        laps: pd.DataFrame,
        session_id: object,
        driver_id: object,
        target_driver_id: object,
        lap_number: int,
    ) -> int:
        own = laps[
            (laps["session_id"] == session_id)
            & (laps["driver_id"] == driver_id)
            & (laps["lap_number"] == lap_number)
        ]
        target = laps[
            (laps["session_id"] == session_id)
            & (laps["driver_id"] == target_driver_id)
            & (laps["lap_number"] == lap_number)
        ]
        if own.empty or target.empty:
            return 0
        return compound_advantage(own.iloc[0].get("compound"), target.iloc[0].get("compound"))

    @staticmethod
    def _track_degradation(
        laps: pd.DataFrame, session_id: object, lap_number: int, window: int = 8
    ) -> float:
        subset = laps[
            (laps["session_id"] == session_id)
            & (laps["lap_number"] <= lap_number)
            & (laps["lap_number"] >= lap_number - window)
        ].dropna(subset=["lap_time_ms"])
        if subset["lap_number"].nunique() < 3:
            return 0.0
        medians = subset.groupby("lap_number", as_index=False)["lap_time_ms"].median()
        return float(medians["lap_number"].corr(medians["lap_time_ms"]) or 0.0)
