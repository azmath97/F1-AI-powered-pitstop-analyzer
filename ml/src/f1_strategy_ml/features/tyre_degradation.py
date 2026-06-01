import pandas as pd

from f1_strategy_ml.features.common import normalize_compound


class TyreDegradationFeatureBuilder:
    required_columns = {
        "session_id",
        "driver_id",
        "lap_number",
        "lap_time_ms",
        "compound",
        "tyre_age_laps",
        "stint_number",
    }

    def build(self, laps: pd.DataFrame, weather: pd.DataFrame) -> pd.DataFrame:
        if laps.empty:
            return pd.DataFrame()
        missing = self.required_columns.difference(laps.columns)
        if missing:
            raise ValueError(f"Tyre degradation features missing columns: {sorted(missing)}")

        frame = laps.copy()
        frame["compound"] = frame["compound"].map(normalize_compound)
        frame["lap_time_ms"] = pd.to_numeric(frame["lap_time_ms"], errors="coerce")
        frame = frame.dropna(subset=["lap_time_ms", "stint_number"])
        if frame.empty:
            return pd.DataFrame()

        weather_features = self._weather_by_session_lap(weather)
        frame = frame.merge(weather_features, on=["session_id", "lap_number"], how="left")
        for column in [
            "air_temp_c",
            "track_temp_c",
            "humidity_pct",
            "wind_speed_mps",
            "rainfall_mm",
        ]:
            frame[column] = frame.groupby("session_id")[column].transform(
                lambda values: values.fillna(values.median())
            )

        group_cols = ["session_id", "driver_id", "stint_number"]
        frame["stint_start_lap_time_ms"] = frame.groupby(group_cols)["lap_time_ms"].transform(
            "first"
        )
        frame["stint_end_lap"] = frame.groupby(group_cols)["lap_number"].transform("max")
        frame["session_lap_median_ms"] = frame.groupby(["session_id", "lap_number"])[
            "lap_time_ms"
        ].transform("median")
        frame["pace_delta_to_field_ms"] = frame["lap_time_ms"] - frame["session_lap_median_ms"]
        frame["tyre_degradation_label_ms"] = frame["lap_time_ms"] - frame["stint_start_lap_time_ms"]
        frame["remaining_laps_label"] = frame["stint_end_lap"] - frame["lap_number"]
        columns = [
            "session_id",
            "season",
            "circuit_id",
            "circuit_name",
            "driver_id",
            "driver_number",
            "lap_number",
            "compound",
            "tyre_age_laps",
            "stint_number",
            "air_temp_c",
            "track_temp_c",
            "humidity_pct",
            "wind_speed_mps",
            "rainfall_mm",
            "pace_delta_to_field_ms",
            "circuit_length_m",
            "total_laps",
            "tyre_degradation_label_ms",
            "remaining_laps_label",
        ]
        return frame[[column for column in columns if column in frame.columns]].reset_index(
            drop=True
        )

    @staticmethod
    def _weather_by_session_lap(weather: pd.DataFrame) -> pd.DataFrame:
        if weather.empty:
            return pd.DataFrame(columns=["session_id", "lap_number"])
        frame = weather.copy()
        if "lap_number" not in frame.columns or frame["lap_number"].isna().all():
            frame = frame.sort_values(["session_id", "recorded_at"])
            frame["lap_number"] = frame.groupby("session_id").cumcount() + 1
        return frame.groupby(["session_id", "lap_number"], as_index=False)[
            ["air_temp_c", "track_temp_c", "humidity_pct", "wind_speed_mps", "rainfall_mm"]
        ].mean(numeric_only=True)
