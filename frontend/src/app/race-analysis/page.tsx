"use client";

import { useRaceSelection } from "@/contexts/race-selection-context";
import { useSessionSummary } from "@/hooks/use-session-summary";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { DataAvailability } from "@/components/strategy/data-availability";
import { PitStopTable } from "@/components/strategy/pit-stop-table";

export default function RaceAnalysisPage() {
  return (
    <AppShell>
      <RaceAnalysisContent />
    </AppShell>
  );
}

function RaceAnalysisContent() {
  const selection = useRaceSelection();
  const enabled = selection.race.status === "completed" && selection.race.round > 0;
  const { data, isLoading, error } = useSessionSummary({
    season: selection.season,
    round: selection.race.round,
    session: selection.session,
    driver: selection.driver,
    enabled
  });

  return (
    <>
      <PageHeader title="Race Brief" eyebrow={`${selection.race.name} / ${selection.session}`} />
      <DataAvailability race={selection.race} />

      <section className="grid gap-3 border border-border bg-[#111418] p-4 lg:grid-cols-4">
        <BriefMetric label="Event" value={selection.race.name} />
        <BriefMetric label="Circuit" value={selection.race.circuit} />
        <BriefMetric label="Session" value={selection.session} />
        <BriefMetric label="Status" value={selection.race.status.toUpperCase()} tone={selection.race.status === "completed" ? "green" : "blue"} />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <BriefPanel
          title="Pit-Stop Focus"
          body={
            selection.race.status === "completed"
              ? "Verified pit-stop rows are loaded first because they drive undercut, overcut, and pit-window analysis."
              : "Pit-stop analysis unlocks after the session has run and FastF1/OpenF1 publish reliable stop and stint records."
          }
        />
        <BriefPanel
          title="Tyre-Stint Focus"
          body="The core dataset is laps, compounds, tyre age, stint boundaries, pit-in/pit-out timing, and weather context. Full car telemetry is optional enrichment, not the main product."
        />
        <BriefPanel
          title="Strategy Modules"
          body="Undercut, overcut, tyre degradation, and simulator views use the compact pit-stop and stint dataset before heavier race-wide analysis."
        />
      </section>

      {!enabled ? (
        <div className="mt-4">
          <EmptyState
            title="Pit-stop data not available yet"
            description="For upcoming races, StintSync keeps this page as a race brief. Pit-stop tables, stint analysis, and strategy predictions appear only after verified session data exists."
          />
        </div>
      ) : isLoading ? (
        <div className="mt-4 h-48 animate-pulse border border-border bg-[#111418]" />
      ) : error || !data ? (
        <div className="mt-4">
          <EmptyState
            title="FastF1 pit-stop data not loaded"
            description="Start the FastAPI backend on port 8000 and ensure FastF1 can access/cache this completed race. The app will not show substitute race-analysis data."
          />
        </div>
      ) : (
        <>
          <div className="mt-4">
            <DriverPitStopFocus
              driver={selection.driver}
              pitStops={data.selectedDriverPitStops}
              totalPitStops={data.totalPitStops}
              driversWithPitStops={data.driversWithPitStops}
            />
          </div>
          <div className="mt-4">
            <PitStopTable
              pitStops={data.pitStops}
              season={selection.season}
              selectedDriver={selection.driver}
              title="Race Pit Stop Log"
            />
          </div>
          <div className="mt-4">
            <EmptyState
              title="Advanced stint analysis waiting for ETL"
              description="The next dataset layer should store compact laps, tyre age, stint boundaries, and pit-cycle gaps for degradation, undercut, overcut, and simulation."
            />
          </div>
        </>
      )}
    </>
  );
}

function BriefMetric({
  label,
  value,
  tone = "default"
}: {
  label: string;
  value: string;
  tone?: "default" | "green" | "blue";
}) {
  const toneClass = tone === "green" ? "text-[#00c853]" : tone === "blue" ? "text-[#2f80ed]" : "text-foreground";
  return (
    <div className="border border-border bg-[#0b0d10] px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className={`metric-font mt-1 truncate text-sm font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function BriefPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-border bg-[#111418] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{title}</div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function DriverPitStopFocus({
  driver,
  pitStops,
  totalPitStops,
  driversWithPitStops
}: {
  driver: string;
  pitStops: { lap: number; stopNumber: number; compoundBefore?: string | null; compoundAfter?: string | null }[];
  totalPitStops: number;
  driversWithPitStops: string[];
}) {
  return (
    <section className="grid gap-3 border border-border bg-[#111418] p-4 md:grid-cols-4">
      <BriefMetric label="Selected Driver" value={driver} />
      <BriefMetric label="Driver Stops" value={`${pitStops.length}`} tone={pitStops.length > 0 ? "green" : "blue"} />
      <BriefMetric label="Race Stops" value={`${totalPitStops}`} />
      <BriefMetric label="Drivers Stopped" value={`${driversWithPitStops.length}`} />
      <div className="text-sm text-muted-foreground md:col-span-4">
        {pitStops.length > 0
          ? pitStops.map((stop) => `Stop ${stop.stopNumber}: lap ${stop.lap}, ${stop.compoundBefore ?? "Unknown"} to ${stop.compoundAfter ?? "Unknown"}`).join(" | ")
          : "No verified race pit stops for this selected driver/session."}
      </div>
    </section>
  );
}
