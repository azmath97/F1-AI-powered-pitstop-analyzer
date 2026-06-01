"use client";

import { ChartPanel } from "@/components/charts/chart-panel";
import { downloadCsv } from "@/components/charts/plotly-chart";
import {
  PitGainCurve,
  ProbabilityGauge,
  ShapImportance,
  ShapWaterfall
} from "@/components/charts/motorsport-charts";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { pitWindowHeatmap, shapFeatures } from "@/lib/mock-data";

export default function OvercutPage() {
  return (
    <AppShell>
      <PageHeader title="Overcut Analysis" eyebrow="Extended-stint probability model" />
      <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <ChartPanel title="Overcut Probability Gauge">
          <ProbabilityGauge title="Overcut" value={0.42} />
        </ChartPanel>
        <ChartPanel title="Expected Gain Curves" onCsv={() => downloadCsv("overcut-gain.csv", pitWindowHeatmap)}>
          <PitGainCurve cells={pitWindowHeatmap} />
        </ChartPanel>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartPanel title="SHAP Explanation" onCsv={() => downloadCsv("overcut-shap.csv", shapFeatures)}>
          <ShapImportance features={shapFeatures.map((item) => ({ ...item, value: item.value * 0.72 }))} />
        </ChartPanel>
        <ChartPanel title="SHAP Waterfall">
          <ShapWaterfall features={shapFeatures.map((item) => ({ ...item, value: item.value * 0.72 }))} />
        </ChartPanel>
      </div>
    </AppShell>
  );
}
