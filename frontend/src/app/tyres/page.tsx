"use client";

import { ChartPanel } from "@/components/charts/chart-panel";
import { downloadCsv } from "@/components/charts/plotly-chart";
import {
  CompoundComparisonChart,
  ProbabilityGauge,
  TyreDegradationCurve
} from "@/components/charts/motorsport-charts";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { compounds, tyreCurve } from "@/lib/mock-data";

export default function TyresPage() {
  return (
    <AppShell>
      <PageHeader title="Tyre Analytics" eyebrow="Degradation and life prediction" />
      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
        <ChartPanel title="Tyre Degradation Curve" onCsv={() => downloadCsv("tyre-degradation.csv", tyreCurve)}>
          <TyreDegradationCurve points={tyreCurve} />
        </ChartPanel>
        <div className="grid gap-4">
          <ChartPanel title="Tyre Health Gauge">
            <ProbabilityGauge title="Health" value={0.43} />
          </ChartPanel>
          <div className="border border-border bg-[#111418] p-4">
            <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Remaining Life</div>
            <div className="metric-font mt-2 text-4xl font-semibold">6.5 LAPS</div>
            <div className="mt-2 text-sm text-muted-foreground">LightGBM RUL prediction target</div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <ChartPanel title="Compound Comparison" onCsv={() => downloadCsv("compound-comparison.csv", compounds)}>
          <CompoundComparisonChart compounds={compounds} />
        </ChartPanel>
      </div>
    </AppShell>
  );
}
