# Backend

FastAPI service scaffold for StintSync.

The backend defines route groups, Pydantic contracts, configuration, database session wiring, live-session contracts, and test structure. Production OpenF1 streaming, strategy logic, ML inference, and simulation execution can be attached behind these contracts.

## Run Locally

```bash
cd backend
uvicorn app.main:app --reload
```

## Test

```bash
pytest backend/tests
```
