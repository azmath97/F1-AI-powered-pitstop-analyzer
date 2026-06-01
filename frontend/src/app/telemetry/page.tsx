"use client";

import { useState } from "react";

import { ChartPanel } from "@/components/charts/chart-panel";
import { downloadCsv } from "@/components/charts/plotly-chart";
import { DriverComparisonOverlay, PaceDeltaAnalysis, RacingLine, TelemetryTrace } from "@/components/charts/motorsport-charts";
import { useRaceSelection } from "@/contexts/race-selection-context";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { DataAvailability } from "@/components/strategy/data-availability";
import { telemetry } from "@/lib/mock-data";

export default function TelemetryPage() {
  const [hoverX, setHoverX] = useState<number | undefined>();
  return (
    <AppShell>
      <TelemetryContent hoverX={hoverX} setHoverX={setHoverX} />
    </AppShell>
  );
}

function TelemetryContent({
  hoverX,
  setHoverX
}: {
  hoverX?: number;
  setHoverX: (value: number) => void;
}) {
  const selection = useRaceSelection();
  return (
    <>
      <PageHeader title="Telemetry Analytics" eyebrow={`${selection.race.name} / ${selection.session} / ${selection.driver}`} />
      <DataAvailability race={selection.race} />
      {!selection.hasValidatedTelemetry ? (
        <EmptyState
          title="No validated telemetry for this selection"
          description="Telemetry charts are hidden until FastF1/OpenF1 session samples are loaded for the selected race, driver, and session."
        />
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
            <div className="grid gap-4">
              <ChartPanel title="Speed Trace" onCsv={() => downloadCsv("speed-trace.csv", telemetry)}>
                <TelemetryTrace points={telemetry} metric="speed" color="#f5f7fa" hoverX={hoverX} onHover={setHoverX} />
              </ChartPanel>
              <ChartPanel title="Throttle Trace" onCsv={() => downloadCsv("throttle-trace.csv", telemetry)}>
                <TelemetryTrace points={telemetry} metric="throttle" color="#00c853" hoverX={hoverX} onHover={setHoverX} />
              </ChartPanel>
              <ChartPanel title="Brake Trace" onCsv={() => downloadCsv("brake-trace.csv", telemetry)}>
                <TelemetryTrace points={telemetry} metric="brake" color="#e10600" hoverX={hoverX} onHover={setHoverX} />
              </ChartPanel>
            </div>
            <ChartPanel title="GPS Racing Line" subtitle="Color-coded by speed" onCsv={() => downloadCsv("gps-line.csv", telemetry)}>
              <RacingLine points={telemetry} hoverX={hoverX} />
            </ChartPanel>
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <ChartPanel title="Pace Delta Analysis" onCsv={() => downloadCsv("pace-delta.csv", telemetry)}>
              <PaceDeltaAnalysis points={telemetry} />
            </ChartPanel>
            <ChartPanel title="Driver Comparison Overlay" onCsv={() => downloadCsv("driver-overlay.csv", telemetry)}>
              <DriverComparisonOverlay points={telemetry} />
            </ChartPanel>
          </div>
        </>
      )}
    </>
  );
}
