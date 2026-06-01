create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('fastf1', 'openf1', 'mixed')),
  season integer check (season is null or season >= 2018),
  session_key integer,
  session_name text,
  status text not null check (status in ('started', 'completed', 'failed', 'skipped')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  records_extracted integer not null default 0 check (records_extracted >= 0),
  records_loaded integer not null default 0 check (records_loaded >= 0),
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  constraint ingestion_runs_time_order check (finished_at is null or finished_at >= started_at)
);

create table if not exists public.data_quality_reports (
  id uuid primary key default gen_random_uuid(),
  ingestion_run_id uuid references public.ingestion_runs(id) on delete set null,
  dataset_name text not null,
  status text not null check (status in ('passed', 'warning', 'failed')),
  total_rows integer not null default 0 check (total_rows >= 0),
  failed_checks integer not null default 0 check (failed_checks >= 0),
  warning_checks integer not null default 0 check (warning_checks >= 0),
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.dataset_artifacts (
  id uuid primary key default gen_random_uuid(),
  dataset_name text not null,
  artifact_path text not null,
  row_count integer not null check (row_count >= 0),
  column_count integer not null check (column_count >= 0),
  label_column text,
  statistics jsonb not null default '{}'::jsonb,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (dataset_name, artifact_path)
);

create table if not exists public.position_snapshots (
  id bigserial primary key,
  session_id uuid not null references public.sessions(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete restrict,
  recorded_at timestamptz not null,
  position integer not null check (position > 0),
  source text not null default 'openf1',
  created_at timestamptz not null default now()
);

create unique index if not exists idx_position_snapshots_unique
on public.position_snapshots(session_id, driver_id, recorded_at);

create unique index if not exists idx_telemetry_unique_source
on public.telemetry(session_id, driver_id, sample_time, coalesce(source_sample_id, ''));

create index if not exists idx_ingestion_runs_source_status
on public.ingestion_runs(source, status, started_at desc);

create index if not exists idx_quality_reports_dataset_created
on public.data_quality_reports(dataset_name, created_at desc);

create index if not exists idx_position_snapshots_session_driver_time
on public.position_snapshots(session_id, driver_id, recorded_at);

alter table public.ingestion_runs enable row level security;
alter table public.data_quality_reports enable row level security;
alter table public.dataset_artifacts enable row level security;
alter table public.position_snapshots enable row level security;

grant select on public.ingestion_runs to authenticated;
grant select on public.data_quality_reports to authenticated;
grant select on public.dataset_artifacts to authenticated;
grant select on public.position_snapshots to authenticated;

create policy "authenticated_read_ingestion_runs"
on public.ingestion_runs for select to authenticated using (true);

create policy "authenticated_read_data_quality_reports"
on public.data_quality_reports for select to authenticated using (true);

create policy "authenticated_read_dataset_artifacts"
on public.dataset_artifacts for select to authenticated using (true);

create policy "authenticated_read_position_snapshots"
on public.position_snapshots for select to authenticated using (true);
