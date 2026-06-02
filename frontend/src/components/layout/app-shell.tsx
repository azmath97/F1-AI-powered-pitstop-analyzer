"use client";

import {
  Activity,
  Building2,
  CircuitBoard,
  Flag,
  Gauge,
  GitCompare,
  LayoutDashboard,
  Moon,
  RadioTower,
  Route,
  Sun,
  TimerReset,
  UserRound,
  Video
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { RaceSelectionProvider } from "@/contexts/race-selection-context";
import { getDriversForSeason, getNextRaceForSeason, getRacesForSeason, raceCatalogue } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { RaceStatus } from "@/types/f1";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/live", label: "Live Race", icon: RadioTower },
  { href: "/race-analysis", label: "Race Analysis", icon: Flag },
  { href: "/race-replay", label: "Race Replay", icon: Video },
  { href: "/telemetry", label: "Telemetry", icon: Activity },
  { href: "/tyres", label: "Tyres", icon: Gauge },
  { href: "/undercut", label: "Undercut", icon: GitCompare },
  { href: "/overcut", label: "Overcut", icon: Route },
  { href: "/simulator", label: "Simulator", icon: TimerReset },
  { href: "/drivers", label: "Drivers", icon: UserRound },
  { href: "/teams", label: "Teams", icon: Building2 },
  { href: "/circuits", label: "Circuits", icon: CircuitBoard }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [light, setLight] = useState(false);
  const [season, setSeason] = useState(2026);
  const [raceId, setRaceId] = useState<string | undefined>();
  const [driver, setDriver] = useState("NOR");
  const [session, setSession] = useState("Race");
  const races = getRacesForSeason(season);
  const defaultRace = getNextRaceForSeason(season) ?? races[0] ?? raceCatalogue[0];
  const selectedRace = races.find((race) => race.id === raceId) ?? defaultRace;
  const drivers = getDriversForSeason(season);
  const selection = useMemo(
    () => ({
      season,
      race: selectedRace,
      driver,
      session,
      hasValidatedTelemetry: selectedRace.hasTelemetry && selectedRace.status === "completed"
    }),
    [driver, season, selectedRace, session]
  );

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
  }, [light]);

  useEffect(() => {
    setRaceId(defaultRace.id);
    setDriver(getDriversForSeason(season)[0] ?? "NOR");
    setSession(defaultRace.sessions.at(-1) ?? "Race");
  }, [defaultRace.id, defaultRace.sessions, season]);

  return (
    <RaceSelectionProvider value={selection}>
      <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r bg-[#0b0d10] lg:block">
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            <CircuitBoard className="h-4 w-4" />
            StintSync
          </div>
          <div className="mt-2 text-base font-semibold">Race Intelligence Platform</div>
        </div>
        <nav className="space-y-1 p-3" aria-label="Primary">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 border border-transparent px-3 py-2 text-sm text-muted-foreground outline-none transition-colors focus-visible:border-primary",
                  active
                    ? "border-border bg-[#171b21] text-foreground"
                    : "hover:border-border hover:bg-[#111418] hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 text-xs text-muted-foreground">
          <div className="font-mono text-foreground">STINTSYNC: ONLINE</div>
          <div>Supabase + Render target</div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-[#0b0d10]/95 backdrop-blur">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <RadioTower className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Race Engineering Workspace</div>
                <div className="flex flex-wrap items-center gap-2 font-mono text-sm text-foreground">
                  <span>
                    {selectedRace.circuit.toUpperCase()} / RACE /{" "}
                    {selectedRace.status === "cancelled" ? "CANCELLED" : selectedRace.status === "upcoming" ? "PRE-RACE" : "DATA VIEW"}
                  </span>
                  <StatusBadge status={selectedRace.status} />
                </div>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <label className="grid gap-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Season
                <select
                  className="h-9 min-w-28 border border-border bg-[#111418] px-2 font-mono text-sm text-foreground outline-none focus:border-primary"
                  value={season}
                  onChange={(event) => setSeason(Number(event.target.value))}
                >
                  {Array.from(new Set(raceCatalogue.map((race) => race.season))).map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <RaceSelect races={races} selectedRaceId={selectedRace.id} onChange={setRaceId} />
              <Select label="Driver" values={drivers} value={driver} onChange={setDriver} />
              <Select label="Session" values={selectedRace.sessions} value={session} onChange={setSession} />
              <Button
                variant="outline"
                className="h-9 border-border bg-[#111418] sm:col-span-2 lg:col-span-1"
                onClick={() => setLight((value) => !value)}
                aria-label="Toggle theme"
              >
                {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Theme
              </Button>
            </div>
          </div>
        </header>
        <main className="px-4 py-4 xl:px-6">{children}</main>
      </div>
      </div>
    </RaceSelectionProvider>
  );
}

function RaceSelect({
  races,
  selectedRaceId,
  onChange
}: {
  races: typeof raceCatalogue;
  selectedRaceId: string;
  onChange: (raceId: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
      Race
      <select
        className="h-9 min-w-44 border border-border bg-[#111418] px-2 font-mono text-sm text-foreground outline-none focus:border-primary"
        value={selectedRaceId}
        onChange={(event) => onChange(event.target.value)}
      >
        {races.map((race) => (
          <option key={race.id} value={race.id}>
            {statusLabel(race.status)} {race.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function statusLabel(status: RaceStatus) {
  if (status === "live") return "[LIVE]";
  if (status === "upcoming") return "[UPCOMING]";
  if (status === "cancelled") return "[CANCELLED]";
  return "[COMPLETED]";
}

function StatusBadge({ status }: { status: RaceStatus }) {
  const styles = {
    live: "border-[#e10600] text-[#e10600]",
    upcoming: "border-[#2f80ed] text-[#2f80ed]",
    completed: "border-[#00c853] text-[#00c853]",
    cancelled: "border-[#9aa4b2] text-[#9aa4b2]"
  };
  return (
    <span className={`border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${styles[status]}`}>
      {status}
    </span>
  );
}

function Select({
  label,
  values,
  value,
  onChange
}: {
  label: string;
  values: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
      {label}
      <select
        className="h-9 min-w-36 border border-border bg-[#111418] px-2 font-mono text-sm text-foreground outline-none focus:border-primary"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {values.map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>
    </label>
  );
}
