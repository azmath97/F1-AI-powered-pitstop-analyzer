alter table public.sessions
  add column if not exists openf1_meeting_key integer,
  add column if not exists openf1_session_key integer,
  add column if not exists race_status text not null default 'upcoming'
    check (race_status in ('live', 'upcoming', 'completed'));

create unique index if not exists idx_sessions_openf1_session_key
  on public.sessions(openf1_session_key)
  where openf1_session_key is not null;

create index if not exists idx_sessions_season_round_status
  on public.sessions(season, round_number, race_status);

create table if not exists public.live_session_snapshots (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  lap_number integer not null check (lap_number >= 0),
  payload jsonb not null,
  source text not null default 'openf1',
  captured_at timestamptz not null default now()
);

create index if not exists idx_live_session_snapshots_session_time
  on public.live_session_snapshots(session_id, captured_at desc);

create index if not exists idx_live_session_snapshots_payload_gin
  on public.live_session_snapshots using gin (payload);
