FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /workspace

COPY pyproject.toml README.md /workspace/
COPY backend /workspace/backend
COPY ml /workspace/ml

RUN pip install --no-cache-dir --upgrade pip \
  && pip install --no-cache-dir -e ".[ml,dev]"

CMD ["python", "-m", "f1_strategy_ml.cli"]
