# Machine Learning Layer

## Models

### Tyre Degradation Prediction

- Algorithm: LightGBM regression.
- Target: `remaining_laps_label`.
- Output: remaining useful tyre life in laps.
- Requirements covered: hyperparameter tuning, cross-validation, feature importance,
  SHAP explanations, MLflow tracking, local registry artifacts.

### Undercut Success Prediction

- Algorithm: XGBoost binary classifier.
- Target: `undercut_success_label`.
- Output: calibrated probability of successful undercut.
- Requirements covered: probability calibration, SHAP explainability, evaluation dashboard.

### Overcut Success Prediction

- Algorithm: CatBoost binary classifier.
- Target: `overcut_success_label`.
- Output: calibrated probability of successful overcut.
- Requirements covered: probability calibration, SHAP explainability, evaluation dashboard.

## Training

Build datasets first:

```bash
f1-build-datasets --database-url postgresql+asyncpg://f1_app:f1_app_password@localhost:5432/f1_strategy
```

Train all models:

```bash
f1-train-models --model all --dataset-dir datasets/processed --artifact-dir ml/artifacts
```

Train one model:

```bash
f1-train-models --model undercut_success
```

Generated artifacts:

- `ml/artifacts/registry.json`
- `ml/artifacts/<model>/<version>/model.joblib`
- `ml/artifacts/<model>/<version>/metadata.json`
- `datasets/reports/modeling/*_evaluation.json`
- `datasets/reports/modeling/*_dashboard.html`
- `datasets/reports/modeling/*_shap.json`

## Inference APIs

Endpoints:

- `POST /api/v1/predictions/tyres`
- `POST /api/v1/predictions/undercut`
- `POST /api/v1/predictions/overcut`
- `POST /api/v1/simulations/strategy`

Prediction requests accept `feature_overrides` so the frontend or strategy engine can pass
model-ready features while the historical feature store matures.

## Monte Carlo Strategy Simulator

The simulator evaluates pit laps 10-50 by default and runs 10,000 simulations.

Inputs:

- Driver
- Track
- Current lap
- Tyre state
- Gaps
- Weather

Model dependencies:

- Tyre remaining-life model.
- Undercut success model.
- Overcut success model.

Outputs:

- Optimal pit window
- Expected gain
- Expected position
- Confidence score
- Risk score

