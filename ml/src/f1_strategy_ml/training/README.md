# Training

Training pipelines are implemented for:

- LightGBM tyre remaining-useful-life regression.
- XGBoost undercut success classification with calibration.
- CatBoost overcut success classification with calibration.

Run all models:

```bash
f1-train-models --model all --dataset-dir datasets/processed
```

Each run performs hyperparameter tuning, cross-validation, evaluation reporting,
feature importance, SHAP report generation, MLflow tracking, and local model
registry registration under `ml/artifacts`.
