# API Specification

Base URL: `http://localhost:8000`

Version prefix: `/api/v1`

The foundation exposes route groups and typed contracts. Strategy computation, model inference, and simulations return placeholder responses until the relevant modules are implemented.
In the current scaffold, computation endpoints return `501 Not Implemented`.

## Core Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Service health check |
| GET | `/api/v1/drivers` | List drivers |
| GET | `/api/v1/teams` | List teams |
| GET | `/api/v1/circuits` | List circuits |
| GET | `/api/v1/sessions` | List race sessions |
| GET | `/api/v1/sessions/{session_id}` | Fetch session metadata |
| GET | `/api/v1/sessions/{session_id}/laps` | Fetch lap records |
| GET | `/api/v1/sessions/{session_id}/telemetry` | Fetch telemetry samples |
| GET | `/api/v1/strategy/command-center` | Command center aggregate contract |
| POST | `/api/v1/predictions/undercut` | Predict calibrated undercut success probability |
| POST | `/api/v1/predictions/overcut` | Predict calibrated overcut success probability |
| POST | `/api/v1/predictions/tyres` | Predict tyre remaining useful life |
| POST | `/api/v1/simulations/strategy` | Run Monte Carlo strategy simulation |

## Response Conventions

- IDs are UUID strings.
- Durations are milliseconds.
- Probabilities are decimal values between `0` and `1`.
- Percentages are decimal values between `0` and `100`.
- API errors use FastAPI's standard JSON error shape.
- Prediction responses include model name, model version, confidence, and feature snapshot.
- Inference endpoints return `503` when trained model artifacts are not registered yet.
