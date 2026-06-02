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
import { useSessionSummary } from "@/hooks/use-session-summary";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { DataAvailability } from "@/components/strategy/data-availability";
import { PitStopTable } from "@/components/strategy/pit-stop-table";
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
  const canLoadCompletedRace = selection.race.status === "completed" && selection.race.round > 0;
  const { data, isLoading, error } = useSessionSummary({
    season: selection.season,
    round: selection.race.round,
    session: selection.session,
    enabled: canLoadCompletedRace
  });

  return (
    <>
      <PageHeader title="Overcut Analysis" eyebrow={`${selection.race.name} / ${selection.driver}`} />
      <DataAvailability race={selection.race} />
      <StrategyExplainer mode="overcut" />
      {selection.hasValidatedTelemetry ? (
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
      ) : !canLoadCompletedRace ? (
        <div className="mt-4">
          <EmptyState
            title="Overcut analysis unavailable"
            description="Upcoming and cancelled races do not have completed pit-cycle data. StintSync will not fabricate overcut probabilities before the race data exists."
          />
        </div>
      ) : isLoading ? (
        <div className="mt-4 h-56 animate-pulse border border-border bg-[#111418]" />
      ) : error || !data ? (
        <div className="mt-4">
          <EmptyState
            title="FastF1 pit-cycle data unavailable"
            description="Start the FastAPI backend on port 8000 and ensure FastF1 can access/cache this completed race."
          />
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.75fr]">
            <PitStopTable pitStops={data.pitStops} season={selection.season} />
            <ModelPendingPanel
              title="Overcut model pending"
              body="FastF1 pit-cycle data is loaded for this completed race. The probability gauge is held back until lap pace, clean-air windows, tyre degradation, and model artifacts are trained from the ETL datasets."
            />
          </div>
        </>
      )}
    </>
  );
}

function ModelPendingPanel({ title, body }: { title: string; body: string }) {
  return (
    <section className="border border-border bg-[#111418] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{title}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </section>
  );
}
