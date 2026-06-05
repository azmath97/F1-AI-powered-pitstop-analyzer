"use client";

import { ChartPanel } from "@/components/charts/chart-panel";
import { downloadCsv } from "@/components/charts/plotly-chart";
import { LivePositionTracker } from "@/components/charts/motorsport-charts";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { LiveRacePanel, LiveTelemetryStrip } from "@/components/live/live-race-panel";
import { EmptyState } from "@/components/states/empty-state";
import { useLiveRace } from "@/hooks/use-live-race";

export default function LiveRacePage() {
  const { data: snapshot, isLoading, error } = useLiveRace();

  return (
    <AppShell>
      <PageHeader title="LIVE" eyebrow="Race session only">
        <div className="font-mono text-xs text-muted-foreground">REFRESH: 5S / SOURCE: OPENF1</div>
      </PageHeader>
      {isLoading || !snapshot ? (
        <div className="h-96 animate-pulse border border-border bg-[#111418]" />
      ) : error ? (
        <EmptyState
          title="Live race status unavailable"
          description="The backend could not reach OpenF1. StintSync will not show fallback live race data."
        />
      ) : (
        <div className="grid gap-4">
          <LiveRacePanel snapshot={snapshot} />
          {snapshot.status !== "live" ? (
            <EmptyState
              title="No race is live"
              description="LIVE only opens during an active Grand Prix Race session. Practice, qualifying, sprint sessions, upcoming races, and finished races stay hidden here."
            />
          ) : (
            <>
              <LiveTelemetryStrip snapshot={snapshot} />
              <div className="grid gap-4">
                <ChartPanel title="Live Position Tracker" subtitle="OpenF1 Race session positions" onCsv={() => downloadCsv("live-position.csv", snapshot.drivers)}>
                  <LivePositionTracker drivers={snapshot.drivers} />
                </ChartPanel>
              </div>
            </>
          )}
        </div>
      )}
    </AppShell>
  );
}
