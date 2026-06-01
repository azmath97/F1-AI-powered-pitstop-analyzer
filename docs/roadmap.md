# Development Roadmap

## Phase 0: Foundation

- Monorepo scaffold.
- Docker Compose runtime.
- PostgreSQL and Supabase schemas.
- Seed data.
- API contract.
- Frontend dashboard shell.
- Unit test structure.

## Phase 1: Historical Race Analysis

- FastF1 and OpenF1 ingestion jobs.
- Session, lap, stint, pit stop, weather, and telemetry importers.
- Read APIs for command center and telemetry views.
- Plotly charts connected to persisted data.

## Phase 2: Strategy Models

- Feature store conventions.
- Tyre degradation baseline model.
- Undercut and overcut baseline classifiers.
- SHAP explainability generation.
- MLflow experiment tracking and model registry flow.

## Phase 3: Simulation

- Monte Carlo race simulation engine.
- Safety car scenario simulator.
- Traffic projection module.
- Simulation result persistence and visualization.

## Phase 4: Productionization

- Auth and tenant strategy.
- Background workers and scheduled ingestion.
- Observability dashboards.
- CI checks for API, frontend, migrations, and model package.
- Deployment targets for Vercel, Render, Supabase, and managed MLflow.

