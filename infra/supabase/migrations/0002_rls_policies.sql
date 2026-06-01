alter table public.teams enable row level security;
alter table public.drivers enable row level security;
alter table public.circuits enable row level security;
alter table public.sessions enable row level security;
alter table public.laps enable row level security;
alter table public.telemetry enable row level security;
alter table public.weather enable row level security;
alter table public.stints enable row level security;
alter table public.pit_stops enable row level security;
alter table public.undercut_predictions enable row level security;
alter table public.overcut_predictions enable row level security;
alter table public.tyre_predictions enable row level security;
alter table public.simulations enable row level security;

grant usage on schema public to authenticated;
grant select on public.teams to authenticated;
grant select on public.drivers to authenticated;
grant select on public.circuits to authenticated;
grant select on public.sessions to authenticated;
grant select on public.laps to authenticated;
grant select on public.telemetry to authenticated;
grant select on public.weather to authenticated;
grant select on public.stints to authenticated;
grant select on public.pit_stops to authenticated;
grant select on public.undercut_predictions to authenticated;
grant select on public.overcut_predictions to authenticated;
grant select on public.tyre_predictions to authenticated;
grant select on public.simulations to authenticated;

create policy "authenticated_read_teams"
on public.teams for select to authenticated using (true);

create policy "authenticated_read_drivers"
on public.drivers for select to authenticated using (true);

create policy "authenticated_read_circuits"
on public.circuits for select to authenticated using (true);

create policy "authenticated_read_sessions"
on public.sessions for select to authenticated using (true);

create policy "authenticated_read_laps"
on public.laps for select to authenticated using (true);

create policy "authenticated_read_telemetry"
on public.telemetry for select to authenticated using (true);

create policy "authenticated_read_weather"
on public.weather for select to authenticated using (true);

create policy "authenticated_read_stints"
on public.stints for select to authenticated using (true);

create policy "authenticated_read_pit_stops"
on public.pit_stops for select to authenticated using (true);

create policy "authenticated_read_undercut_predictions"
on public.undercut_predictions for select to authenticated using (true);

create policy "authenticated_read_overcut_predictions"
on public.overcut_predictions for select to authenticated using (true);

create policy "authenticated_read_tyre_predictions"
on public.tyre_predictions for select to authenticated using (true);

create policy "authenticated_read_simulations"
on public.simulations for select to authenticated using (true);
