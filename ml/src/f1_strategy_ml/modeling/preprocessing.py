from dataclasses import dataclass

import pandas as pd

NON_FEATURE_COLUMNS = {
    "session_id",
    "driver_id",
    "target_driver_id",
    "lap_id",
    "circuit_id",
    "team_id",
    "driver_code",
    "team_name",
}


@dataclass(frozen=True)
class FeatureSchema:
    feature_columns: list[str]
    numeric_columns: list[str]
    categorical_columns: list[str]


def infer_feature_schema(frame: pd.DataFrame, target_column: str) -> FeatureSchema:
    excluded = NON_FEATURE_COLUMNS | {target_column}
    feature_columns = [column for column in frame.columns if column not in excluded]
    numeric_columns = [
        column for column in feature_columns if pd.api.types.is_numeric_dtype(frame[column])
    ]
    categorical_columns = [column for column in feature_columns if column not in numeric_columns]
    return FeatureSchema(
        feature_columns=feature_columns,
        numeric_columns=numeric_columns,
        categorical_columns=categorical_columns,
    )


def split_features_target(
    frame: pd.DataFrame,
    target_column: str,
    feature_columns: list[str],
) -> tuple[pd.DataFrame, pd.Series]:
    clean = frame.dropna(subset=[target_column]).copy()
    features = clean[feature_columns].copy()
    target = clean[target_column].copy()
    return features, target
