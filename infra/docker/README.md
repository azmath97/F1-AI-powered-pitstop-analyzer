# Docker Infrastructure

Component Dockerfiles live next to their services:

- `frontend/Dockerfile`
- `backend/Dockerfile`
- `ml/Dockerfile`

The root `docker-compose.yml` wires local services together.

Use the ML profile for training-oriented commands:

```bash
docker compose --profile ml run --rm ml f1-train-models --model all
```
