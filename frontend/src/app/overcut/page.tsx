"use client";

import { useRaceSelection } from "@/contexts/race-selection-context";
import { useSessionSummary } from "@/hooks/use-session-summary";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { DataAvailability } from "@/components/strategy/data-availability";
import { PitStopTable } from "@/components/strategy/pit-stop-table";
import { StrategyExplainer } from "@/components/strategy/strategy-explainer";

export default function OvercutPage() {
  return (
    <AppShell>
      <OvercutContent />
    </AppShell>
  );
}

function OvercutContent() {
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
      <PageHeader title="Overcut Analysis" eyebrow={`${selection.race.name} / ${selection.driver}`} />
      <DataAvailability race={selection.race} />
      <StrategyExplainer mode="overcut" />
      {!canLoadCompletedRace ? (
        <div className="mt-4">
          <EmptyState
            title="Overcut analysis unavailable"
            description="Upcoming and cancelled races do not have completed pit-cycle data. StintSync will not fabricate overcut probabilities before the race data exists."
          />
        </div>
      ) : isLoading ? (
        <div className="mt-4 h-56 animate-pulse border border-border bg-[#111418]" />
      ) : error || !data ? (
        <div className="mt-4">
          <EmptyState
            title="FastF1 pit-cycle data unavailable"
            description="Start the FastAPI backend on port 8000 and ensure FastF1 can access/cache this completed race."
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
            title="Overcut model pending"
            body="FastF1 pit-cycle data is loaded for this completed race. The probability gauge is held back until lap pace, clean-air windows, tyre degradation, and model artifacts are trained from the ETL datasets."
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
