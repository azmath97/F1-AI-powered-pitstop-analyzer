insert into public.teams (id, constructor_id, name, nationality, base_country, color_hex)
values
  ('00000000-0000-0000-0000-000000000101', 'red_bull', 'Red Bull Racing', 'Austrian', 'United Kingdom', '#3671C6'),
  ('00000000-0000-0000-0000-000000000102', 'mclaren', 'McLaren', 'British', 'United Kingdom', '#FF8000'),
  ('00000000-0000-0000-0000-000000000103', 'ferrari', 'Ferrari', 'Italian', 'Italy', '#E80020')
on conflict (constructor_id) do nothing;

insert into public.drivers (id, driver_number, code, full_name, country_code, current_team_id)
values
  ('00000000-0000-0000-0000-000000000201', 1, 'VER', 'Max Verstappen', 'NL', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000202', 4, 'NOR', 'Lando Norris', 'GB', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000203', 16, 'LEC', 'Charles Leclerc', 'MC', '00000000-0000-0000-0000-000000000103')
on conflict (driver_number) do nothing;

insert into public.circuits (id, circuit_key, name, country, locality, length_m, latitude, longitude, timezone)
values
  ('00000000-0000-0000-0000-000000000301', 7, 'Silverstone Circuit', 'United Kingdom', 'Silverstone', 5891, 52.0786, -1.0169, 'Europe/London')
on conflict (circuit_key) do nothing;

insert into public.sessions (
  id,
  session_key,
  circuit_id,
  season,
  round_number,
  name,
  type,
  status,
  starts_at,
  total_laps,
  pit_lane_loss_ms,
  weather_source
)
values (
  '00000000-0000-0000-0000-000000000401',
  9158,
  '00000000-0000-0000-0000-000000000301',
  2025,
  12,
  'British Grand Prix',
  'race',
  'completed',
  '2025-07-06T14:00:00Z',
  52,
  22500,
  'seed'
)
on conflict (session_key) do nothing;

insert into public.laps (
  session_id,
  driver_id,
  team_id,
  lap_number,
  position,
  lap_time_ms,
  sector_1_ms,
  sector_2_ms,
  sector_3_ms,
  compound,
  tyre_age_laps,
  stint_number
)
values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 21, 1, 90531, 28910, 33412, 28209, 'medium', 21, 1),
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', 21, 2, 90744, 29022, 33518, 28204, 'medium', 21, 1),
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000103', 21, 3, 91290, 29210, 33771, 28309, 'hard', 8, 1)
on conflict (session_id, driver_id, lap_number) do nothing;

insert into public.weather (
  session_id,
  recorded_at,
  lap_number,
  air_temp_c,
  track_temp_c,
  humidity_pct,
  pressure_hpa,
  wind_speed_mps,
  wind_direction_deg,
  rainfall_mm,
  is_raining
)
values (
  '00000000-0000-0000-0000-000000000401',
  '2025-07-06T14:34:00Z',
  21,
  22.4,
  31.8,
  58.0,
  1009.2,
  3.4,
  250,
  0,
  false
)
on conflict (session_id, recorded_at) do nothing;

insert into public.stints (
  session_id,
  driver_id,
  team_id,
  stint_number,
  compound,
  start_lap,
  end_lap,
  start_tyre_age_laps,
  laps_completed,
  degradation_slope_ms_per_lap
)
values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 1, 'medium', 1, 22, 0, 22, 82.5),
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', 1, 'medium', 1, 23, 0, 23, 76.2)
on conflict (session_id, driver_id, stint_number) do nothing;

insert into public.pit_stops (
  session_id,
  driver_id,
  lap_number,
  stop_number,
  stationary_ms,
  total_pit_lane_ms,
  compound_from,
  compound_to
)
values (
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000202',
  23,
  1,
  2400,
  22400,
  'medium',
  'hard'
)
on conflict (session_id, driver_id, stop_number) do nothing;

insert into public.undercut_predictions (
  id,
  session_id,
  driver_id,
  target_driver_id,
  lap_number,
  model_name,
  model_version,
  probability,
  expected_gain_ms,
  confidence,
  feature_snapshot,
  shap_values
)
values (
  '00000000-0000-0000-0000-000000000501',
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000201',
  22,
  'seed-undercut-baseline',
  '0.0.0',
  0.8100,
  4300,
  0.8700,
  '{"tyre_age_delta": 4, "traffic_risk": 0.22, "pit_lane_loss_ms": 22500}'::jsonb,
  '{"tyre_age_delta": 0.22, "pace_advantage": 0.18, "traffic_risk": -0.10}'::jsonb
)
on conflict (id) do nothing;

insert into public.overcut_predictions (
  id,
  session_id,
  driver_id,
  target_driver_id,
  lap_number,
  model_name,
  model_version,
  probability,
  expected_gain_ms,
  confidence,
  feature_snapshot,
  shap_values
)
values (
  '00000000-0000-0000-0000-000000000502',
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000201',
  22,
  'seed-overcut-baseline',
  '0.0.0',
  0.4200,
  900,
  0.7300,
  '{"clean_air_probability": 0.35, "degradation_delta_ms": 180}'::jsonb,
  '{"clean_air_probability": 0.08, "degradation_delta_ms": -0.14}'::jsonb
)
on conflict (id) do nothing;

insert into public.tyre_predictions (
  id,
  session_id,
  driver_id,
  lap_number,
  compound,
  tyre_age_laps,
  health_pct,
  remaining_laps,
  performance_loss_ms,
  confidence,
  model_name,
  model_version,
  feature_snapshot,
  shap_values
)
values (
  '00000000-0000-0000-0000-000000000503',
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000202',
  22,
  'medium',
  22,
  43.0,
  6.5,
  1850,
  0.8400,
  'seed-tyre-baseline',
  '0.0.0',
  '{"compound": "medium", "track_temp_c": 31.8, "stint_laps": 22}'::jsonb,
  '{"stint_laps": -0.18, "track_temp_c": -0.07, "compound_medium": 0.04}'::jsonb
)
on conflict (id) do nothing;

insert into public.simulations (
  id,
  session_id,
  driver_id,
  scenario_type,
  name,
  parameters,
  iterations,
  win_probability,
  podium_probability,
  top5_probability,
  expected_finish,
  result_distribution,
  created_by
)
values (
  '00000000-0000-0000-0000-000000000601',
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000202',
  'race_strategy',
  'Seed baseline race strategy',
  '{"pit_lap": 23, "compound_sequence": ["medium", "hard"], "safety_car_lap": null}'::jsonb,
  10000,
  0.1800,
  0.6400,
  0.9100,
  2.7,
  '{"P1": 0.18, "P2": 0.31, "P3": 0.15, "P4": 0.14, "P5": 0.13, "P6+": 0.09}'::jsonb,
  'seed'
)
on conflict (id) do nothing;
