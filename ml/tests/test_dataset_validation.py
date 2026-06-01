import pandas as pd

from f1_strategy_ml.datasets.validation import DatasetValidator


def test_dataset_validator_fails_missing_label() -> None:
    result = DatasetValidator().validate(
        "undercut_dataset", pd.DataFrame({"feature": [1]}), "label"
    )

    assert result.status == "failed"


def test_dataset_validator_passes_minimal_dataset() -> None:
    result = DatasetValidator().validate(
        "undercut_dataset",
        pd.DataFrame({"feature": [1], "label": [0]}),
        "label",
    )

    assert result.status == "passed"
