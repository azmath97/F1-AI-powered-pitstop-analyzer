"use client";

import { useState } from "react";

import { ChartPanel } from "@/components/charts/chart-panel";
import { downloadCsv } from "@/components/charts/plotly-chart";
import { DriverComparisonOverlay, PaceDeltaAnalysis, RacingLine, TelemetryTrace } from "@/components/charts/motorsport-charts";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { telemetry } from "@/lib/mock-data";

export default function TelemetryPage() {
  const [hoverX, setHoverX] = useState<number | undefined>();
  return (
    <AppShell>
      <PageHeader title="Telemetry Analytics" eyebrow="Driver trace overlay" />
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
          <div className="grid gap-4 md:grid-cols-2">
            <ChartPanel title="Gear Trace" onCsv={() => downloadCsv("gear-trace.csv", telemetry)}>
              <TelemetryTrace points={telemetry} metric="gear" color="#ffb300" hoverX={hoverX} onHover={setHoverX} />
            </ChartPanel>
            <ChartPanel title="Delta Trace" onCsv={() => downloadCsv("delta-trace.csv", telemetry)}>
              <TelemetryTrace points={telemetry} metric="delta" color="#2f80ed" hoverX={hoverX} onHover={setHoverX} />
            </ChartPanel>
          </div>
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
    </AppShell>
  );
}
