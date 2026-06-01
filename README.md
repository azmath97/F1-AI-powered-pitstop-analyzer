# F1 Strategy Intelligence Engine

Production-ready project foundation for an AI-powered Formula 1 strategy intelligence platform.

The PRD calls for pit-window optimization, undercut and overcut intelligence, tyre degradation forecasting, race simulations, safety-car scenarios, explainable AI, telemetry analytics, and interactive circuit analysis. This repository sets up the architecture, schemas, API contracts, and runtime scaffolding for those modules without implementing ML models or strategy business logic yet.

## Stack

- Frontend: Next.js 15, TypeScript, Tailwind, ShadCN-style primitives, Plotly.
- Backend: FastAPI, Python 3.12, Pydantic, SQLAlchemy async.
- Database: PostgreSQL, Supabase migrations and RLS.
- ML: XGBoost, LightGBM, CatBoost, SHAP, MLflow dependencies and package structure.
- Infrastructure: Docker and Docker Compose.

## Quickstart

```bash
cp .env.example .env
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`
- MLflow: `http://localhost:5000`

Optional ML scaffold container:

```bash
docker compose --profile ml run --rm ml
```

## What Is Included

- Complete system architecture in `docs/architecture.md`.
- Folder structure in `docs/folder-structure.md`.
- Development roadmap in `docs/roadmap.md`.
- Data engineering plan and commands in `docs/data-engineering.md`.
- Machine learning layer guide in `docs/machine-learning.md`.
- PostgreSQL schema and Supabase migrations in `infra/supabase/migrations`.
- Supabase notes in `docs/database/supabase-schema.md`.
- ERD in `docs/diagrams/er-diagram.mmd`.
- API specification in `docs/api`.
- Backend, frontend, ML, datasets, notebooks, docs, and infra directories.
- Unit test structure for backend, frontend, and ML.

## Implementation Boundary

This scaffold intentionally does not implement:

- ML training or inference.
- Strategy recommendations.
- Race simulation business logic.
- Data ingestion from FastF1 or OpenF1.

Those pieces belong in the next phases once contracts and persistence are stable.

## Data Engineering

Run ETL after PostgreSQL is available:

```bash
f1-etl --source both --start-year 2018 --end-year 2026
```

Build parquet datasets:

```bash
f1-build-datasets --database-url postgresql+asyncpg://f1_app:f1_app_password@localhost:5432/f1_strategy
```

Generated datasets:

- `datasets/processed/undercut_dataset.parquet`
- `datasets/processed/overcut_dataset.parquet`
- `datasets/processed/tyre_dataset.parquet`

## Machine Learning

Train models after datasets exist:

```bash
f1-train-models --model all --dataset-dir datasets/processed --artifact-dir ml/artifacts
```

The training layer produces MLflow runs, evaluation dashboards, SHAP reports, model
artifacts, and a local model registry.
