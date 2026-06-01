"use client";

import { ChartPanel } from "@/components/charts/chart-panel";
import { downloadCsv } from "@/components/charts/plotly-chart";
import {
  PitWindowHeatmap,
  PositionDistributionChart,
  SimulationHistogram
} from "@/components/charts/motorsport-charts";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { pitWindowHeatmap, positionDistribution, simulationHistogram } from "@/lib/mock-data";

export default function SimulatorPage() {
  return (
    <AppShell>
      <PageHeader title="Strategy Simulator" eyebrow="Monte Carlo pit-lap sweep" />
      <ChartPanel title="Pit Window Heatmap" subtitle="10,000 simulation baseline" onCsv={() => downloadCsv("simulation-window.csv", pitWindowHeatmap)}>
        <PitWindowHeatmap cells={pitWindowHeatmap} height={560} />
      </ChartPanel>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.8fr_0.6fr]">
        <ChartPanel title="Simulation Histogram" onCsv={() => downloadCsv("simulation-histogram.csv", simulationHistogram)}>
          <SimulationHistogram bins={simulationHistogram} />
        </ChartPanel>
        <ChartPanel title="Position Distribution" onCsv={() => downloadCsv("position-distribution.csv", positionDistribution)}>
          <PositionDistributionChart distribution={positionDistribution} />
        </ChartPanel>
        <div className="border border-border bg-[#111418] p-4">
          <Metric label="Optimal Window" value="Lap 22-24" />
          <Metric label="Expected Gain" value="+4.1s" />
          <Metric label="Confidence" value="87%" />
          <Metric label="Risk" value="23%" />
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="metric-font mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
