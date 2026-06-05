"use client";

import { useRaceSelection } from "@/contexts/race-selection-context";
import { useSessionSummary } from "@/hooks/use-session-summary";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { DataAvailability } from "@/components/strategy/data-availability";
import { PitStopTable } from "@/components/strategy/pit-stop-table";
import { getApiErrorMessage } from "@/lib/api";

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
    driver: selection.driver,
    enabled
  });

  return (
    <>
      <PageHeader title="Pit Stop Review" eyebrow={`${selection.race.name} / ${selection.session}`} />
      <DataAvailability race={selection.race} />
      <div className="grid gap-4">
        {!enabled ? (
          <EmptyState
            title="Pit-stop review unavailable"
            description="Cancelled and upcoming races do not have verified pit-stop or tyre-stint records yet. This page will stay empty until real session data exists."
          />
        ) : isLoading ? (
          <div className="h-48 animate-pulse border border-border bg-[#111418]" />
        ) : error || !data ? (
          <EmptyState
            title="FastF1 pit-stop data not loaded"
            description={getApiErrorMessage(error)}
          />
        ) : (
          <>
            <PitStopTable
              pitStops={data.selectedDriverPitStops}
              season={selection.season}
              selectedDriver={selection.driver}
              title={`${selection.driver} Pit Stops`}
            />
            <PitStopTable
              pitStops={data.pitStops}
              season={selection.season}
              selectedDriver={selection.driver}
              title="Full Race Pit Stop Log"
            />
            <EmptyState
              title="Tyre-stint detail waiting for ETL"
              description="Store compact lap, compound, tyre age, pit-cycle gap, and stint records next. Full replay position data is no longer part of the core workflow."
            />
          </>
        )}
      </div>
    </>
  );
}
