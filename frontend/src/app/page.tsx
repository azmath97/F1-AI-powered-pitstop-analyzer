"use client";

import { ChartPanel } from "@/components/charts/chart-panel";
import { downloadCsv } from "@/components/charts/plotly-chart";
import { PitWindowHeatmap, RaceTimeline } from "@/components/charts/motorsport-charts";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { pitWindowHeatmap, raceTimeline, recommendation } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeader title="Dashboard" eyebrow="Live strategy command">
        <div className="font-mono text-xs text-muted-foreground">DATA SOURCE: FASTF1 / OPENF1 SAMPLE</div>
      </PageHeader>

      <section className="mb-4 border border-border bg-[#111418]">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border-b border-border p-4 lg:border-b-0 lg:border-r">
            <div className="text-xs uppercase tracking-[0.2em] text-primary">Current recommendation</div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <HeroMetric label="Pit Window" value={recommendation.pitWindow} />
              <HeroMetric label="Undercut" value={`${Math.round(recommendation.undercutProbability * 100)}%`} />
              <HeroMetric label="Overcut" value={`${Math.round(recommendation.overcutProbability * 100)}%`} />
              <HeroMetric label="Expected Gain" value={`+${recommendation.expectedGainSeconds.toFixed(1)}s`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-0">
            <HeroMetric label="Confidence" value={`${Math.round(recommendation.confidence * 100)}%`} compact />
            <HeroMetric label="Risk" value={`${Math.round(recommendation.risk * 100)}%`} compact />
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        <ChartPanel
          title="Pit Window Heatmap"
          subtitle="Expected gain and risk by candidate stop lap"
          onCsv={() => downloadCsv("pit-window.csv", pitWindowHeatmap)}
        >
          <PitWindowHeatmap cells={pitWindowHeatmap} height={540} />
        </ChartPanel>
        <ChartPanel
          title="Race Timeline"
          subtitle="Pit events, safety-car risk, weather shifts, and track-position changes"
          onCsv={() => downloadCsv("race-timeline.csv", raceTimeline)}
        >
          <RaceTimeline events={raceTimeline} />
        </ChartPanel>
      </div>
    </AppShell>
  );
}

function HeroMetric({
  label,
  value,
  compact = false
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className={`border-border ${compact ? "border-l p-4" : ""}`}>
      <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="metric-font mt-1 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}
