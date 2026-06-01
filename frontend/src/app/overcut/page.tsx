"use client";

import { ChartPanel } from "@/components/charts/chart-panel";
import { downloadCsv } from "@/components/charts/plotly-chart";
import {
  PitGainCurve,
  ProbabilityGauge,
  ShapImportance,
  ShapWaterfall,
  StrategyConfidenceBands
} from "@/components/charts/motorsport-charts";
import { useRaceSelection } from "@/contexts/race-selection-context";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { DataAvailability } from "@/components/strategy/data-availability";
import { StrategyExplainer } from "@/components/strategy/strategy-explainer";
import { pitWindowHeatmap, shapFeatures } from "@/lib/mock-data";

export default function OvercutPage() {
  return (
    <AppShell>
      <OvercutContent />
    </AppShell>
  );
}

function OvercutContent() {
  const selection = useRaceSelection();
  return (
    <>
      <PageHeader title="Overcut Analysis" eyebrow={`${selection.race.name} / ${selection.driver}`} />
      <DataAvailability race={selection.race} />
      <StrategyExplainer mode="overcut" />
      {!selection.hasValidatedTelemetry ? (
        <div className="mt-4">
          <EmptyState
            title="Overcut model unavailable"
            description="The overcut model is disabled until clean-air windows, tyre degradation, traffic, and rival pit-cycle data are loaded for the selected session."
          />
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
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
          <div className="mt-4">
            <ChartPanel title="Strategy Confidence Bands" onCsv={() => downloadCsv("overcut-confidence.csv", pitWindowHeatmap)}>
              <StrategyConfidenceBands cells={pitWindowHeatmap} />
            </ChartPanel>
          </div>
        </>
      )}
    </>
  );
}
