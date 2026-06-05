"use client";

import { useRaceSelection } from "@/contexts/race-selection-context";
import { useSessionSummary } from "@/hooks/use-session-summary";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { DataAvailability } from "@/components/strategy/data-availability";
import { PitStopTable } from "@/components/strategy/pit-stop-table";
import { StrategyExplainer } from "@/components/strategy/strategy-explainer";
import { getApiErrorMessage } from "@/lib/api";

export default function UndercutPage() {
  return (
    <AppShell>
      <UndercutContent />
    </AppShell>
  );
}

function UndercutContent() {
  const selection = useRaceSelection();
  const canLoadCompletedRace = selection.race.status === "completed" && selection.race.round > 0;
  const { data, isLoading, error } = useSessionSummary({
    season: selection.season,
    round: selection.race.round,
    session: selection.session,
    driver: selection.driver,
    enabled: canLoadCompletedRace
  });

  return (
    <>
      <PageHeader title="Undercut Analysis" eyebrow={`${selection.race.name} / ${selection.driver}`} />
      <DataAvailability race={selection.race} />
      <StrategyExplainer mode="undercut" />
      {!canLoadCompletedRace ? (
        <div className="mt-4">
          <EmptyState
            title="Undercut analysis unavailable"
            description="Upcoming and cancelled races do not have completed pit-cycle data. StintSync will not fabricate undercut probabilities before the race data exists."
          />
        </div>
      ) : isLoading ? (
        <div className="mt-4 h-56 animate-pulse border border-border bg-[#111418]" />
      ) : error || !data ? (
        <div className="mt-4">
          <EmptyState
            title="FastF1 pit-cycle data unavailable"
            description={getApiErrorMessage(error)}
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.75fr]">
          <PitStopTable
            pitStops={data.selectedDriverPitStops}
            season={selection.season}
            selectedDriver={selection.driver}
            title={`${selection.driver} Pit Stops`}
          />
          <ModelPendingPanel
            title="Undercut model pending"
            body="FastF1 pit-cycle data is loaded for this completed race. The probability gauge is held back until gap history, out-lap pace, tyre age deltas, traffic, and model artifacts are trained from the ETL datasets."
          />
        </div>
      )}
    </>
  );
}

function ModelPendingPanel({ title, body }: { title: string; body: string }) {
  return (
    <section className="border border-border bg-[#111418] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{title}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </section>
  );
}
