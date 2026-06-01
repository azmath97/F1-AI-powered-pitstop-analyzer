"use client";

import { ChartPanel } from "@/components/charts/chart-panel";
import { downloadCsv } from "@/components/charts/plotly-chart";
import {
  HistoricalScenarioExplorer,
  ProbabilityGauge,
  ShapImportance,
  ShapWaterfall,
  TrackPositionProjection
} from "@/components/charts/motorsport-charts";
import { StrategyTable } from "@/components/strategy/strategy-table";
import { useRaceSelection } from "@/contexts/race-selection-context";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { DataAvailability } from "@/components/strategy/data-availability";
import { StrategyExplainer } from "@/components/strategy/strategy-explainer";
import { pitWindowHeatmap, scenarioMatches, shapFeatures } from "@/lib/mock-data";

export default function UndercutPage() {
  return (
    <AppShell>
      <UndercutContent />
    </AppShell>
  );
}

function UndercutContent() {
  const selection = useRaceSelection();
  return (
    <>
      <PageHeader title="Undercut Analysis" eyebrow={`${selection.race.name} / ${selection.driver}`} />
      <DataAvailability race={selection.race} />
      <StrategyExplainer mode="undercut" />
      {!selection.hasValidatedTelemetry ? (
        <div className="mt-4">
          <EmptyState
            title="Undercut model unavailable"
            description="The undercut probability model needs validated lap pace, gaps, pit-stop history, tyre age, and traffic data for the selected session."
          />
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
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
            <ChartPanel title="Track Position Projection" onCsv={() => downloadCsv("undercut-track-projection.csv", pitWindowHeatmap)}>
              <TrackPositionProjection cells={pitWindowHeatmap} />
            </ChartPanel>
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.8fr]">
            <ChartPanel title="Historical Similar Scenario Explorer" onCsv={() => downloadCsv("undercut-scenarios.csv", scenarioMatches)}>
              <HistoricalScenarioExplorer scenarios={scenarioMatches} />
            </ChartPanel>
            <StrategyTable title="Strategy Comparison Table" />
          </div>
        </>
      )}
    </>
  );
}
