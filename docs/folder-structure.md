# Folder Structure

```text
f1-strategy-intelligence-engine/
  frontend/                 Next.js 15 dashboard
    src/app/                App router entry points
    src/components/         Chart, layout, command-center, and UI primitives
    src/lib/                API client and utility helpers
    src/types/              Frontend domain types
    tests/unit/             Frontend unit test area
  backend/                  FastAPI service using clean architecture boundaries
    app/api/                HTTP route layer
    app/core/               Settings and logging
    app/db/                 Database session infrastructure
    app/domain/             Entities and repository interfaces
    app/schemas/            Pydantic request and response contracts
    app/services/           Future orchestration services
    app/workers/            Future ingestion and async job entry points
    tests/unit/             Backend unit tests
    tests/integration/      Future database-backed tests
  ml/                       Future feature engineering, training, inference, SHAP, MLflow code
    src/f1_strategy_ml/     Python ML package
    tests/                  ML contract and feature tests
  datasets/                 Raw, processed, and external data staging
  notebooks/                Exploratory notebooks
  docs/                     Architecture, API, database, and diagram documentation
    api/                    API contract files
    database/               PostgreSQL and Supabase schema documentation
    diagrams/               Mermaid ERD
    data-engineering.md     ETL, validation, and dataset-generation guide
  infra/                    Docker, Supabase migrations, seed scripts, operations helpers
    supabase/migrations/    SQL migrations
    supabase/seed/          Deterministic demo seed data
    scripts/                Local operational scripts
  docker-compose.yml        Local orchestration
  pyproject.toml            Python dependency and tooling config
  package.json              Root workspace scripts
  .env.example              Environment template
```
