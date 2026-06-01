import { GapEvolutionChart, StrategyConfidenceBands } from "@/components/charts/motorsport-charts";
import { ChartPanel } from "@/components/charts/chart-panel";
import { EntityIntelligence } from "@/components/intelligence/entity-intelligence";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { pitWindowHeatmap, replayFrames, teamIntelligence } from "@/lib/mock-data";

export default function TeamsPage() {
  return (
    <AppShell>
      <PageHeader title="Teams Intelligence" eyebrow="Constructor operations and strategy profile" />
      <div className="grid gap-4">
        <ChartPanel title="Strategy Confidence Bands">
          <StrategyConfidenceBands cells={pitWindowHeatmap} />
        </ChartPanel>
        <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <ChartPanel title="Gap Evolution">
            <GapEvolutionChart frames={replayFrames} />
          </ChartPanel>
          <EntityIntelligence entities={teamIntelligence} />
        </div>
      </div>
    </AppShell>
  );
}
