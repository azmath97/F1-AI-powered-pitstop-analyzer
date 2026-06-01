"use client";

import { ChartPanel } from "@/components/charts/chart-panel";
import { downloadCsv } from "@/components/charts/plotly-chart";
import { ProbabilityGauge, ShapImportance, ShapWaterfall } from "@/components/charts/motorsport-charts";
import { StrategyTable } from "@/components/strategy/strategy-table";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { shapFeatures } from "@/lib/mock-data";

export default function UndercutPage() {
  return (
    <AppShell>
      <PageHeader title="Undercut Analysis" eyebrow="Early-stop probability model" />
      <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <ChartPanel title="Undercut Probability Gauge">
          <ProbabilityGauge title="Undercut" value={0.81} />
        </ChartPanel>
        <ChartPanel title="SHAP Explanation" onCsv={() => downloadCsv("undercut-shap.csv", shapFeatures)}>
          <ShapImportance features={shapFeatures} />
        </ChartPanel>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <ChartPanel title="SHAP Waterfall">
          <ShapWaterfall features={shapFeatures} />
        </ChartPanel>
        <StrategyTable title="Historical Similar Situations" />
      </div>
    </AppShell>
  );
}
