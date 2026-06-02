"use client";

import { useRaceSelection } from "@/contexts/race-selection-context";
import { useSessionSummary } from "@/hooks/use-session-summary";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { DataAvailability } from "@/components/strategy/data-availability";
import { PitStopTable } from "@/components/strategy/pit-stop-table";

export default function RaceReplayPage() {
  return (
    <AppShell>
      <RaceReplayContent />
    </AppShell>
  );
}

function RaceReplayContent() {
  const selection = useRaceSelection();
  const enabled = selection.race.status === "completed" && selection.race.round > 0;
  const { data, isLoading, error } = useSessionSummary({
    season: selection.season,
    round: selection.race.round,
    session: selection.session,
    enabled
  });

  return (
    <>
      <PageHeader title="Race Replay" eyebrow={`${selection.race.name} / ${selection.session}`} />
      <DataAvailability race={selection.race} />
      <div className="grid gap-4">
        {!enabled ? (
          <EmptyState
            title="Replay unavailable"
            description="Cancelled and upcoming races do not have verified lap-by-lap position history. StintSync will not show a synthetic leader or position order."
          />
        ) : isLoading ? (
          <div className="h-48 animate-pulse border border-border bg-[#111418]" />
        ) : error || !data ? (
          <EmptyState
            title="FastF1 race data not loaded"
            description="Start the FastAPI backend with FastF1 access for this completed session. Replay charts stay hidden until verified data is available."
          />
        ) : (
          <>
            <PitStopTable pitStops={data.pitStops} season={selection.season} />
            <EmptyState
              title="Lap-by-lap replay waiting for ETL"
              description="Position evolution, gap evolution, tyre timeline, and leader state need validated lap-by-lap records in PostgreSQL or Supabase. No fake P1 or synthetic gaps are displayed."
            />
          </>
        )}
      </div>
    </>
  );
}
