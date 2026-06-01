# Production Checklist

## Frontend

- Lighthouse performance target above 90.
- Charts are dynamically imported and route split by App Router page.
- Export controls are enabled for CSV and screenshots.
- Dark theme is the primary surface.
- Loading, error, and empty states exist.
- Keyboard focus is visible on navigation and controls.
- `NEXT_PUBLIC_API_BASE_URL` points to Render backend.

## Backend

- Render service has database, Supabase, MLflow, and artifact env vars.
- Model artifacts are present before enabling prediction endpoints.
- API returns `503` for missing models rather than silent placeholder predictions.

## Database

- Supabase migrations applied.
- RLS policies enabled.
- ETL metadata tables monitored.

## ML

- Datasets generated from validated ETL output.
- `f1-train-models --model all` completed.
- MLflow runs include metrics and artifacts.
- `ml/artifacts/registry.json` contains promoted model versions.

## Operations

- GitHub Actions CI passes.
- Vercel and Render deploy hooks configured.
- Secrets are stored in platform secret stores, not committed.

