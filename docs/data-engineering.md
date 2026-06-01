# Data Engineering Layer

## Source Strategy

FastF1 is the historical backbone for 2018-present ingestion. It extracts session schedules, lap timing, sector timing, tyre compounds, stint-like lap metadata, weather, car telemetry, and position/GPS data where available.

OpenF1 is used as a structured API enrichment source for 2023-present sessions. It extracts sessions, drivers, laps, car data, location/GPS samples, weather, stints, pit stops, and position snapshots.

## ETL Pipeline

Entry point:

```bash
f1-etl --source both --start-year 2018 --end-year 2026 --sessions practice qualifying sprint race
```

For a small smoke run:

```bash
f1-etl --source openf1 --start-year 2024 --end-year 2024 --no-telemetry
```

The ETL pipeline:

- Discovers historical sessions.
- Extracts normalized frames from FastF1 and OpenF1.
- Validates required columns, nulls, uniqueness, ranges, and session completeness.
- Retries external OpenF1 calls with exponential backoff.
- Logs session-level results using structured JSON logs.
- Loads normalized records into PostgreSQL.
- Writes validation reports to `datasets/reports`.
- Stores quality report metadata in `public.data_quality_reports`.
- Stores ingestion status in `public.ingestion_runs`.

## PostgreSQL Storage

Primary analytical tables:

- `drivers`
- `teams`
- `circuits`
- `sessions`
- `laps`
- `telemetry`
- `weather`
- `stints`
- `pit_stops`
- `position_snapshots`

Operational metadata:

- `ingestion_runs`
- `data_quality_reports`
- `dataset_artifacts`

## Feature Engineering

Entry point:

```bash
f1-build-datasets --database-url postgresql+asyncpg://f1_app:f1_app_password@localhost:5432/f1_strategy
```

Outputs:

- `datasets/processed/undercut_dataset.parquet`
- `datasets/processed/overcut_dataset.parquet`
- `datasets/processed/tyre_dataset.parquet`

Reports:

- `datasets/reports/*_statistics.json`
- `datasets/reports/*_profile.json`
- `datasets/reports/*_validation.json`

## Feature Families

Tyre degradation:

- Compound
- Tyre age
- Weather
- Pace delta to field
- Track and circuit metadata
- Remaining stint laps label
- Tyre degradation label in milliseconds

Undercut:

- Gap
- Pace delta
- Tyre age delta
- Track position
- Traffic score
- Automatic success label based on gaining position after pit cycle

Overcut:

- Clean air score
- Pace trend
- Compound advantage
- Track degradation
- Gap and track position
- Automatic success label based on gaining position by extending stint

