# Backend

FastAPI service scaffold for the F1 Strategy Intelligence Engine.

The backend currently defines route groups, Pydantic contracts, configuration, database session wiring, and test structure. Strategy logic, ML inference, simulation execution, and ingestion are intentionally deferred.

## Run Locally

```bash
cd backend
uvicorn app.main:app --reload
```

## Test

```bash
pytest backend/tests
```

