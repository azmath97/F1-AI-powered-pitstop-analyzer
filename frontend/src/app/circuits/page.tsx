"use client";

import { RacingLine, SafetyCarImpactAnalysis, TrackPositionProjection } from "@/components/charts/motorsport-charts";
import { ChartPanel } from "@/components/charts/chart-panel";
import { useRaceSelection } from "@/contexts/race-selection-context";
import { EntityIntelligence } from "@/components/intelligence/entity-intelligence";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { DataAvailability } from "@/components/strategy/data-availability";
import { circuitIntelligence, getCircuitPointsForRace, pitWindowHeatmap, raceTimeline } from "@/lib/mock-data";

export default function CircuitsPage() {
  return (
    <AppShell>
      <CircuitsContent />
    </AppShell>
  );
}

function CircuitsContent() {
  const selection = useRaceSelection();
  const points = getCircuitPointsForRace(selection.race.id);
  return (
    <>
      <PageHeader title="Circuits Intelligence" eyebrow={`${selection.race.circuit} / ${selection.race.name}`} />
      <DataAvailability race={selection.race} />
      <div className="grid gap-4">
        <ChartPanel title="Circuit Schematic" subtitle="Race-specific outline; telemetry racing line appears only after validated samples are loaded">
          <RacingLine points={points} title={selection.race.circuit} />
        </ChartPanel>
        {!selection.hasValidatedTelemetry ? (
          <EmptyState
            title="No circuit telemetry loaded"
            description="This view changes by selected race, but it will not display racing-line telemetry until validated OpenF1/FastF1 samples exist for that session."
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartPanel title="Track Position Projection">
              <TrackPositionProjection cells={pitWindowHeatmap} />
            </ChartPanel>
            <ChartPanel title="Safety Car Impact Analysis">
              <SafetyCarImpactAnalysis events={raceTimeline} />
            </ChartPanel>
          </div>
        )}
        <EntityIntelligence entities={circuitIntelligence} />
      </div>
    </>
  );
}
