"use client";

import { ChartPanel } from "@/components/charts/chart-panel";
import { downloadCsv } from "@/components/charts/plotly-chart";
import {
  LivePositionTracker,
  PitWindowHeatmap,
  StrategyConfidenceBands,
  TrackPositionProjection
} from "@/components/charts/motorsport-charts";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { LiveRacePanel, LiveTelemetryStrip } from "@/components/live/live-race-panel";
import { EmptyState } from "@/components/states/empty-state";
import { useLiveRace } from "@/hooks/use-live-race";
import { pitWindowHeatmap } from "@/lib/mock-data";

export default function LiveRacePage() {
  const { data: snapshot, isLoading } = useLiveRace();

  return (
    <AppShell>
      <PageHeader title="Live Race Mode" eyebrow="OpenF1 live data polling">
        <div className="font-mono text-xs text-muted-foreground">REFRESH: 5S / SOURCE: OPENF1</div>
      </PageHeader>
      {isLoading || !snapshot ? (
        <div className="h-96 animate-pulse border border-border bg-[#111418]" />
      ) : (
        <div className="grid gap-4">
          <LiveRacePanel snapshot={snapshot} />
          {snapshot.status !== "live" ? (
            <EmptyState
              title="No race is live"
              description="OpenF1 live telemetry panels stay disabled until an active session is detected. Upcoming races should not show speed, throttle, brake, gaps, or pit calls."
            />
          ) : (
            <>
              <LiveTelemetryStrip snapshot={snapshot} />
              <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <ChartPanel title="Live Position Tracker" subtitle="Track map with leader and selected-driver emphasis" onCsv={() => downloadCsv("live-position.csv", snapshot.drivers)}>
                  <LivePositionTracker drivers={snapshot.drivers} />
                </ChartPanel>
                <div className="grid gap-4">
                  <ChartPanel title="Track Position Projection" onCsv={() => downloadCsv("track-projection.csv", pitWindowHeatmap)}>
                    <TrackPositionProjection cells={pitWindowHeatmap} />
                  </ChartPanel>
                  <ChartPanel title="Strategy Confidence Bands" onCsv={() => downloadCsv("confidence-bands.csv", pitWindowHeatmap)}>
                    <StrategyConfidenceBands cells={pitWindowHeatmap} />
                  </ChartPanel>
                </div>
              </div>
              <ChartPanel title="Pit Window Heatmap" subtitle="Live pit lap optimization surface">
                <PitWindowHeatmap cells={pitWindowHeatmap} height={520} />
              </ChartPanel>
            </>
          )}
        </div>
      )}
    </AppShell>
  );
}
