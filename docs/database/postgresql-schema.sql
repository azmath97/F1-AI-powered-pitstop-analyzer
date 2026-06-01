create extension if not exists pgcrypto;

do $$
begin
  create type public.session_type as enum ('practice', 'qualifying', 'sprint', 'race');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.session_status as enum ('scheduled', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.tyre_compound as enum ('soft', 'medium', 'hard', 'intermediate', 'wet', 'unknown');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.simulation_type as enum ('race_strategy', 'safety_car', 'championship', 'traffic_projection');
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  constructor_id text not null unique,
  name text not null unique,
  nationality text,
  base_country text,
  color_hex text check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  driver_number integer not null check (driver_number between 1 and 99),
  code char(3) not null,
  full_name text not null,
  country_code char(2),
  current_team_id uuid references public.teams(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (driver_number),
  unique (code)
);

create table if not exists public.circuits (
  id uuid primary key default gen_random_uuid(),
  circuit_key integer unique,
  name text not null,
  country text not null,
  locality text,
  length_m integer check (length_m is null or length_m > 0),
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  timezone text,
  layout_geojson jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  session_key integer unique,
  circuit_id uuid not null references public.circuits(id) on delete restrict,
  season integer not null check (season >= 1950),
  round_number integer check (round_number is null or round_number > 0),
  name text not null,
  type public.session_type not null,
  status public.session_status not null default 'scheduled',
  starts_at timestamptz,
  ends_at timestamptz,
  total_laps integer check (total_laps is null or total_laps > 0),
  pit_lane_loss_ms integer check (pit_lane_loss_ms is null or pit_lane_loss_ms >= 0),
  weather_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sessions_time_order check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create table if not exists public.laps (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete restrict,
  team_id uuid references public.teams(id) on delete set null,
  lap_number integer not null check (lap_number > 0),
  position integer check (position is null or position > 0),
  lap_time_ms integer check (lap_time_ms is null or lap_time_ms > 0),
  sector_1_ms integer check (sector_1_ms is null or sector_1_ms > 0),
  sector_2_ms integer check (sector_2_ms is null or sector_2_ms > 0),
  sector_3_ms integer check (sector_3_ms is null or sector_3_ms > 0),
  compound public.tyre_compound not null default 'unknown',
  tyre_age_laps integer not null default 0 check (tyre_age_laps >= 0),
  stint_number integer check (stint_number is null or stint_number > 0),
  is_pit_in_lap boolean not null default false,
  is_pit_out_lap boolean not null default false,
  track_status text,
  created_at timestamptz not null default now(),
  unique (session_id, driver_id, lap_number)
);

create table if not exists public.telemetry (
  id bigserial primary key,
  session_id uuid not null references public.sessions(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete restrict,
  lap_id uuid references public.laps(id) on delete cascade,
  sample_time timestamptz not null,
  distance_m numeric(8, 2) check (distance_m is null or distance_m >= 0),
  speed_kph numeric(6, 2) check (speed_kph is null or speed_kph >= 0),
  throttle_pct numeric(5, 2) check (throttle_pct is null or throttle_pct between 0 and 100),
  brake_pct numeric(5, 2) check (brake_pct is null or brake_pct between 0 and 100),
  gear integer check (gear is null or gear between 0 and 8),
  rpm integer check (rpm is null or rpm >= 0),
  drs integer,
  x numeric(10, 3),
  y numeric(10, 3),
  z numeric(10, 3),
  source_sample_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.weather (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  recorded_at timestamptz not null,
  lap_number integer check (lap_number is null or lap_number > 0),
  air_temp_c numeric(5, 2),
  track_temp_c numeric(5, 2),
  humidity_pct numeric(5, 2) check (humidity_pct is null or humidity_pct between 0 and 100),
  pressure_hpa numeric(7, 2),
  wind_speed_mps numeric(6, 2) check (wind_speed_mps is null or wind_speed_mps >= 0),
  wind_direction_deg integer check (wind_direction_deg is null or wind_direction_deg between 0 and 360),
  rainfall_mm numeric(7, 3) check (rainfall_mm is null or rainfall_mm >= 0),
  is_raining boolean not null default false,
  created_at timestamptz not null default now(),
  unique (session_id, recorded_at)
);

create table if not exists public.stints (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete restrict,
  team_id uuid references public.teams(id) on delete set null,
  stint_number integer not null check (stint_number > 0),
  compound public.tyre_compound not null,
  start_lap integer not null check (start_lap > 0),
  end_lap integer check (end_lap is null or end_lap >= start_lap),
  start_tyre_age_laps integer not null default 0 check (start_tyre_age_laps >= 0),
  laps_completed integer check (laps_completed is null or laps_completed >= 0),
  degradation_slope_ms_per_lap numeric(8, 3),
  created_at timestamptz not null default now(),
  unique (session_id, driver_id, stint_number)
);

create table if not exists public.pit_stops (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete restrict,
  lap_number integer not null check (lap_number > 0),
  stop_number integer not null check (stop_number > 0),
  pit_in_at timestamptz,
  pit_out_at timestamptz,
  stationary_ms integer check (stationary_ms is null or stationary_ms >= 0),
  total_pit_lane_ms integer check (total_pit_lane_ms is null or total_pit_lane_ms >= 0),
  compound_from public.tyre_compound,
  compound_to public.tyre_compound,
  created_at timestamptz not null default now(),
  unique (session_id, driver_id, stop_number)
);

create table if not exists public.undercut_predictions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete restrict,
  target_driver_id uuid references public.drivers(id) on delete set null,
  lap_number integer not null check (lap_number > 0),
  model_name text not null,
  model_version text not null,
  probability numeric(5, 4) not null check (probability between 0 and 1),
  expected_gain_ms integer,
  confidence numeric(5, 4) not null check (confidence between 0 and 1),
  feature_snapshot jsonb not null default '{}'::jsonb,
  shap_values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.overcut_predictions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete restrict,
  target_driver_id uuid references public.drivers(id) on delete set null,
  lap_number integer not null check (lap_number > 0),
  model_name text not null,
  model_version text not null,
  probability numeric(5, 4) not null check (probability between 0 and 1),
  expected_gain_ms integer,
  confidence numeric(5, 4) not null check (confidence between 0 and 1),
  feature_snapshot jsonb not null default '{}'::jsonb,
  shap_values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tyre_predictions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete restrict,
  lap_number integer not null check (lap_number > 0),
  compound public.tyre_compound not null,
  tyre_age_laps integer not null check (tyre_age_laps >= 0),
  health_pct numeric(5, 2) not null check (health_pct between 0 and 100),
  remaining_laps numeric(5, 2) not null check (remaining_laps >= 0),
  performance_loss_ms integer check (performance_loss_ms is null or performance_loss_ms >= 0),
  confidence numeric(5, 4) not null check (confidence between 0 and 1),
  model_name text not null,
  model_version text not null,
  feature_snapshot jsonb not null default '{}'::jsonb,
  shap_values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete set null,
  scenario_type public.simulation_type not null,
  name text not null,
  parameters jsonb not null default '{}'::jsonb,
  iterations integer not null check (iterations > 0),
  win_probability numeric(5, 4) check (win_probability is null or win_probability between 0 and 1),
  podium_probability numeric(5, 4) check (podium_probability is null or podium_probability between 0 and 1),
  top5_probability numeric(5, 4) check (top5_probability is null or top5_probability between 0 and 1),
  expected_finish numeric(5, 2) check (expected_finish is null or expected_finish > 0),
  result_distribution jsonb not null default '{}'::jsonb,
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists idx_drivers_current_team_id on public.drivers(current_team_id);
create index if not exists idx_sessions_circuit_season on public.sessions(circuit_id, season);
create index if not exists idx_sessions_type_status on public.sessions(type, status);
create index if not exists idx_laps_session_lap on public.laps(session_id, lap_number);
create index if not exists idx_laps_driver_session on public.laps(driver_id, session_id);
create index if not exists idx_laps_compound on public.laps(compound);
create index if not exists idx_telemetry_session_driver_time on public.telemetry(session_id, driver_id, sample_time);
create index if not exists idx_telemetry_session_driver_lap_distance on public.telemetry(session_id, driver_id, lap_id, distance_m);
create index if not exists idx_weather_session_time on public.weather(session_id, recorded_at);
create index if not exists idx_stints_session_driver on public.stints(session_id, driver_id);
create index if not exists idx_pit_stops_session_driver_lap on public.pit_stops(session_id, driver_id, lap_number);
create index if not exists idx_undercut_session_driver_lap on public.undercut_predictions(session_id, driver_id, lap_number);
create index if not exists idx_overcut_session_driver_lap on public.overcut_predictions(session_id, driver_id, lap_number);
create index if not exists idx_tyre_predictions_session_driver_lap on public.tyre_predictions(session_id, driver_id, lap_number);
create index if not exists idx_simulations_session_scenario on public.simulations(session_id, scenario_type);

create index if not exists idx_undercut_feature_snapshot_gin on public.undercut_predictions using gin (feature_snapshot);
create index if not exists idx_overcut_feature_snapshot_gin on public.overcut_predictions using gin (feature_snapshot);
create index if not exists idx_tyre_feature_snapshot_gin on public.tyre_predictions using gin (feature_snapshot);
create index if not exists idx_simulations_parameters_gin on public.simulations using gin (parameters);

drop trigger if exists set_updated_at_teams on public.teams;
create trigger set_updated_at_teams
before update on public.teams
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_drivers on public.drivers;
create trigger set_updated_at_drivers
before update on public.drivers
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_circuits on public.circuits;
create trigger set_updated_at_circuits
before update on public.circuits
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_sessions on public.sessions;
create trigger set_updated_at_sessions
before update on public.sessions
for each row execute function public.set_updated_at();

