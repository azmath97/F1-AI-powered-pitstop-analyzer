import { RacingLine, SafetyCarImpactAnalysis, TrackPositionProjection } from "@/components/charts/motorsport-charts";
import { ChartPanel } from "@/components/charts/chart-panel";
import { EntityIntelligence } from "@/components/intelligence/entity-intelligence";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { circuit, circuitIntelligence, pitWindowHeatmap, raceTimeline } from "@/lib/mock-data";

export default function CircuitsPage() {
  return (
    <AppShell>
      <PageHeader title="Circuits Intelligence" eyebrow="Track evolution and event sensitivity" />
      <div className="grid gap-4">
        <ChartPanel title="Interactive Circuit Map">
          <RacingLine points={circuit} title="Circuit Map" />
        </ChartPanel>
        <div className="grid gap-4 xl:grid-cols-2">
          <ChartPanel title="Track Position Projection">
            <TrackPositionProjection cells={pitWindowHeatmap} />
          </ChartPanel>
          <ChartPanel title="Safety Car Impact Analysis">
            <SafetyCarImpactAnalysis events={raceTimeline} />
          </ChartPanel>
        </div>
        <EntityIntelligence entities={circuitIntelligence} />
      </div>
    </AppShell>
  );
}
