# Deployment Guide

## Frontend: Vercel

Project root: `frontend`

Environment variables:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

GitHub Actions deployment requires:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Backend: Render

Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Environment variables:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MLFLOW_TRACKING_URI`
- `MODEL_ARTIFACT_DIR`
- `MODEL_REGISTRY_STAGE`

GitHub Actions deployment requires:

- `RENDER_DEPLOY_HOOK_URL`

## Database: Supabase

Apply migrations in order from `infra/supabase/migrations`.

## Monitoring: MLflow

Point training jobs and backend inference metadata to `MLFLOW_TRACKING_URI`.

