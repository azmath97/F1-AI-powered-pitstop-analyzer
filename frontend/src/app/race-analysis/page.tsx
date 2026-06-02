"use client";

import { ChartPanel } from "@/components/charts/chart-panel";
import { RacingLine } from "@/components/charts/motorsport-charts";
import { useRaceSelection } from "@/contexts/race-selection-context";
import { useCircuitMap } from "@/hooks/use-circuit-map";
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
    enabled
  });
  const {
    data: circuitMap,
    isLoading: isMapLoading,
    error: mapError
  } = useCircuitMap({
    season: selection.season,
    round: selection.race.round,
    session: selection.session,
    driver: selection.driver,
    enabled
  });

  return (
    <>
      <PageHeader title="Race Analysis" eyebrow={`${selection.race.name} / ${selection.session}`} />
      <DataAvailability race={selection.race} />
      {enabled && isMapLoading ? (
        <div className="h-[500px] animate-pulse border border-border bg-[#111418]" />
      ) : enabled && circuitMap && !mapError ? (
        <ChartPanel title="FastF1 Circuit Map" subtitle={`${circuitMap.raceName} / ${circuitMap.driver} fastest lap telemetry`}>
          <RacingLine points={circuitMap.points} title={selection.race.circuit} />
        </ChartPanel>
      ) : (
        <EmptyState
          title="Circuit map unavailable"
          description="No placeholder map is shown here. A map appears only when FastF1 returns real X/Y telemetry for the selected completed session and driver."
        />
      )}

      {!enabled ? (
        <div className="mt-4">
          <EmptyState
            title="Race analysis unavailable"
            description="Cancelled and upcoming races do not have completed-race pit stops, gaps, tyre stints, or position evolution."
          />
        </div>
      ) : isLoading ? (
        <div className="mt-4 h-48 animate-pulse border border-border bg-[#111418]" />
      ) : error || !data ? (
        <div className="mt-4">
          <EmptyState
            title="FastF1 data not loaded"
            description="Start the FastAPI backend on port 8000 and ensure FastF1 can access/cache this season and round. For full telemetry charts, run ETL into PostgreSQL or Supabase."
          />
        </div>
      ) : (
        <>
          <div className="mt-4">
            <PitStopTable pitStops={data.pitStops} season={selection.season} />
          </div>
          <div className="mt-4">
            <EmptyState
              title="Telemetry-dependent charts waiting for ETL"
              description="Position evolution, gap evolution, tyre stint timelines, and safety-car impact charts require validated laps, position history, weather, and race-control data from ETL."
            />
          </div>
        </>
      )}
    </>
  );
}
