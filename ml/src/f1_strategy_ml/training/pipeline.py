from dataclasses import asdict
from typing import Any

import mlflow
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import KFold, RandomizedSearchCV, StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from f1_strategy_ml.explainability.shap_service import ShapExplainer
from f1_strategy_ml.modeling.config import ModelSpec, TrainingConfig
from f1_strategy_ml.modeling.evaluation import EvaluationReportWriter
from f1_strategy_ml.modeling.metrics import classification_metrics, regression_metrics
from f1_strategy_ml.modeling.preprocessing import infer_feature_schema, split_features_target
from f1_strategy_ml.modeling.registry import LocalModelRegistry, ModelMetadata, new_version


class ModelTrainingPipeline:
    def __init__(self, config: TrainingConfig) -> None:
        self.config = config
        self.registry = LocalModelRegistry(config.artifact_dir)
        self.reports = EvaluationReportWriter(config.report_dir)

    def train(self, spec: ModelSpec) -> ModelMetadata:
        frame = pd.read_parquet(self.config.dataset_dir / spec.dataset_file)
        if frame.empty:
            raise ValueError(f"Dataset {spec.dataset_file} is empty.")

        schema = infer_feature_schema(frame, spec.target_column)
        features, target = split_features_target(frame, spec.target_column, schema.feature_columns)
        if len(target) < 2:
            raise ValueError(f"Dataset {spec.dataset_file} needs at least two labeled rows.")
        if spec.task == "classification":
            target = target.astype(int)
            if target.nunique() < 2:
                raise ValueError(f"Dataset {spec.dataset_file} needs at least two label classes.")
            stratify = target if target.nunique() > 1 else None
        else:
            stratify = None

        x_train, x_test, y_train, y_test = train_test_split(
            features,
            target,
            test_size=self.config.test_size,
            random_state=self.config.random_state,
            stratify=stratify,
        )

        estimator, param_distributions = self._estimator(spec)
        pipeline = Pipeline(
            steps=[
                (
                    "preprocess",
                    self._preprocessor(schema.numeric_columns, schema.categorical_columns),
                ),
                ("model", estimator),
            ]
        )
        search = RandomizedSearchCV(
            estimator=pipeline,
            param_distributions=param_distributions,
            n_iter=self.config.n_iter,
            cv=self._cv(spec, y_train),
            scoring=self._scoring(spec),
            random_state=self.config.random_state,
            n_jobs=-1,
            refit=True,
        )

        mlflow.set_tracking_uri(self.config.mlflow_tracking_uri)
        mlflow.set_experiment(self.config.experiment_name)
        with mlflow.start_run(run_name=spec.name):
            mlflow.log_params(asdict(spec))
            mlflow.log_params({"cv_folds": self.config.cv_folds, "n_iter": self.config.n_iter})
            search.fit(x_train, y_train)
            model: Any = search.best_estimator_
            if spec.calibrated:
                model = CalibratedClassifierCV(
                    estimator=model,
                    method="isotonic",
                    cv=self._cv(spec, y_train),
                )
                model.fit(x_train, y_train)

            metrics = self._evaluate(spec, model, x_test, y_test)
            for key, value in metrics.items():
                mlflow.log_metric(key, value)
            mlflow.log_params({f"best_{key}": value for key, value in search.best_params_.items()})

            feature_importance = self._feature_importance(
                model, x_test, y_test, schema.feature_columns
            )
            shap_path = self.config.report_dir / f"{spec.name}_shap.json"
            shap_importance = ShapExplainer(
                sample_size=self.config.shap_sample_size,
                random_state=self.config.random_state,
            ).explain_model(model, x_train[schema.feature_columns], shap_path, spec.task)
            report_payload = {
                "model": asdict(spec),
                "metrics": metrics,
                "best_params": search.best_params_,
                "feature_schema": asdict(schema),
                "feature_importance": feature_importance,
                "shap_importance": shap_importance,
            }
            report_path = self.reports.write_json(spec.name, report_payload)
            dashboard_path = self.reports.write_dashboard(
                spec.name,
                metrics,
                feature_importance,
                shap_importance,
            )
            mlflow.log_artifact(str(report_path))
            mlflow.log_artifact(str(dashboard_path))
            if shap_path.exists():
                mlflow.log_artifact(str(shap_path))

            metadata = ModelMetadata(
                model_name=spec.name,
                algorithm=spec.algorithm,
                task=spec.task,
                version=new_version(),
                stage=self.config.registry_stage,
                artifact_path="",
                feature_columns=schema.feature_columns,
                target_column=spec.target_column,
                metrics=metrics,
                created_at=new_version(),
            )
            registered = self.registry.register(
                model,
                metadata,
                extra_artifacts={
                    "evaluation_report": str(report_path),
                    "dashboard": str(dashboard_path),
                    "shap_report": str(shap_path),
                },
            )
            mlflow.log_artifact(registered.artifact_path)
            return registered

    def _estimator(self, spec: ModelSpec) -> tuple[Any, dict[str, list[Any]]]:
        if spec.algorithm == "lightgbm":
            from lightgbm import LGBMRegressor

            return (
                LGBMRegressor(random_state=self.config.random_state, n_jobs=-1),
                {
                    "model__n_estimators": [200, 400, 800],
                    "model__learning_rate": [0.02, 0.05, 0.1],
                    "model__num_leaves": [15, 31, 63],
                    "model__subsample": [0.7, 0.9, 1.0],
                    "model__colsample_bytree": [0.7, 0.9, 1.0],
                },
            )
        if spec.algorithm == "xgboost":
            from xgboost import XGBClassifier

            return (
                XGBClassifier(
                    objective="binary:logistic",
                    eval_metric="logloss",
                    random_state=self.config.random_state,
                    n_jobs=-1,
                ),
                {
                    "model__n_estimators": [200, 400, 800],
                    "model__max_depth": [2, 3, 5],
                    "model__learning_rate": [0.02, 0.05, 0.1],
                    "model__subsample": [0.7, 0.9, 1.0],
                    "model__colsample_bytree": [0.7, 0.9, 1.0],
                },
            )
        if spec.algorithm == "catboost":
            from catboost import CatBoostClassifier

            return (
                CatBoostClassifier(
                    loss_function="Logloss",
                    random_seed=self.config.random_state,
                    verbose=False,
                    allow_writing_files=False,
                ),
                {
                    "model__iterations": [200, 400, 800],
                    "model__depth": [3, 5, 7],
                    "model__learning_rate": [0.02, 0.05, 0.1],
                    "model__l2_leaf_reg": [1, 3, 5, 7],
                },
            )
        raise ValueError(f"Unsupported algorithm: {spec.algorithm}")

    @staticmethod
    def _preprocessor(
        numeric_columns: list[str], categorical_columns: list[str]
    ) -> ColumnTransformer:
        numeric = Pipeline(steps=[("imputer", SimpleImputer(strategy="median"))])
        categorical = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
            ]
        )
        return ColumnTransformer(
            transformers=[
                ("numeric", numeric, numeric_columns),
                ("categorical", categorical, categorical_columns),
            ],
            remainder="drop",
        )

    def _cv(self, spec: ModelSpec, target: pd.Series) -> KFold | StratifiedKFold:
        if spec.task == "classification" and target.nunique() > 1:
            folds = min(self.config.cv_folds, int(target.value_counts().min()))
            if folds < 2:
                raise ValueError("Classification training requires at least two samples per class.")
            return StratifiedKFold(
                n_splits=folds,
                shuffle=True,
                random_state=self.config.random_state,
            )
        folds = min(self.config.cv_folds, len(target))
        if folds < 2:
            raise ValueError("Regression training requires at least two samples.")
        return KFold(
            n_splits=folds,
            shuffle=True,
            random_state=self.config.random_state,
        )

    @staticmethod
    def _scoring(spec: ModelSpec) -> str:
        return "neg_root_mean_squared_error" if spec.task == "regression" else "roc_auc"

    @staticmethod
    def _evaluate(
        spec: ModelSpec, model: Any, x_test: pd.DataFrame, y_test: pd.Series
    ) -> dict[str, float]:
        if spec.task == "regression":
            return regression_metrics(y_test, model.predict(x_test))
        return classification_metrics(y_test, model.predict_proba(x_test))

    @staticmethod
    def _feature_importance(
        model: Any,
        x_test: pd.DataFrame,
        y_test: pd.Series,
        feature_columns: list[str],
    ) -> dict[str, float]:
        from sklearn.inspection import permutation_importance

        try:
            result = permutation_importance(
                model,
                x_test[feature_columns],
                y_test,
                n_repeats=5,
                random_state=42,
                n_jobs=-1,
            )
            return {
                column: float(value)
                for column, value in zip(feature_columns, result.importances_mean, strict=False)
            }
        except Exception:
            return {}
