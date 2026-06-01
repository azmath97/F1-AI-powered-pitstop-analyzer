# Supabase Schema

Supabase uses the same relational model as PostgreSQL, with one additional migration for row-level security.

Migration files:

- `infra/supabase/migrations/0001_initial_schema.sql`: tables, constraints, foreign keys, indexes, enums, triggers.
- `infra/supabase/migrations/0002_rls_policies.sql`: authenticated read policies and client write lockdown.
- `infra/supabase/migrations/0003_data_engineering_metadata.sql`: ingestion runs, quality reports, dataset artifacts, position snapshots, and telemetry idempotency indexes.
- `infra/supabase/seed/0001_seed_demo.sql`: deterministic demo seed data.

Access pattern:

- Browser clients read through the FastAPI backend by default.
- Supabase authenticated clients may read analytics tables when RLS policies are applied.
- Writes are reserved for trusted backend/service-role workflows, ingestion jobs, and future admin tooling.
