"use client";

import { ChartPanel } from "@/components/charts/chart-panel";
import { RacingLine } from "@/components/charts/motorsport-charts";
import { useRaceSelection } from "@/contexts/race-selection-context";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { DataAvailability } from "@/components/strategy/data-availability";
import { useCircuitMap } from "@/hooks/use-circuit-map";

export default function CircuitsPage() {
  return (
    <AppShell>
      <CircuitsContent />
    </AppShell>
  );
}

function CircuitsContent() {
  const selection = useRaceSelection();
  const enabled = selection.race.status === "completed" && selection.race.round > 0;
  const { data, isLoading, error } = useCircuitMap({
    season: selection.season,
    round: selection.race.round,
    session: selection.session,
    driver: selection.driver,
    enabled
  });

  return (
    <>
      <PageHeader title="Circuits Intelligence" eyebrow={`${selection.race.circuit} / ${selection.race.name}`} />
      <DataAvailability race={selection.race} />
      <div className="grid gap-4">
        {!enabled ? (
          <EmptyState
            title="Circuit telemetry unavailable"
            description="Cancelled and upcoming races do not have FastF1 racing-line coordinates. The app will not draw a placeholder circuit."
          />
        ) : isLoading ? (
          <div className="h-[500px] animate-pulse border border-border bg-[#111418]" />
        ) : error || !data ? (
          <EmptyState
            title="FastF1 circuit map not loaded"
            description="Start the FastAPI backend with FastF1 access for this completed session. No circular placeholder is rendered when real coordinates are missing."
          />
        ) : (
          <ChartPanel title="FastF1 Racing Line" subtitle={`${data.raceName} / ${data.driver} fastest lap telemetry`}>
            <RacingLine points={data.points} title={selection.race.circuit} />
          </ChartPanel>
        )}
      </div>
    </>
  );
}
