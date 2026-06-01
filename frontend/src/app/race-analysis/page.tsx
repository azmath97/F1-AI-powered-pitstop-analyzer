"use client";

import { ChartPanel } from "@/components/charts/chart-panel";
import { downloadCsv } from "@/components/charts/plotly-chart";
import {
  GapEvolutionChart,
  PositionEvolutionChart,
  RacingLine,
  RaceTimeline,
  SafetyCarImpactAnalysis,
  TyreStintTimeline
} from "@/components/charts/motorsport-charts";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { circuit, raceTimeline, replayFrames } from "@/lib/mock-data";

export default function RaceAnalysisPage() {
  return (
    <AppShell>
      <PageHeader title="Race Analysis" eyebrow="Events, positions, circuit context" />
      <div className="grid gap-4">
        <ChartPanel title="Race Position Evolution" onCsv={() => downloadCsv("race-positions.csv", replayFrames.flatMap((frame) => frame.positions))}>
          <PositionEvolutionChart frames={replayFrames} />
        </ChartPanel>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <ChartPanel title="Race Timeline" onCsv={() => downloadCsv("race-events.csv", raceTimeline)}>
          <RaceTimeline events={raceTimeline} />
        </ChartPanel>
        <ChartPanel title="Safety Car Impact Timeline" onCsv={() => downloadCsv("safety-car-impact.csv", raceTimeline)}>
          <SafetyCarImpactAnalysis events={raceTimeline} />
        </ChartPanel>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartPanel title="Gap Evolution" onCsv={() => downloadCsv("gap-evolution.csv", replayFrames.flatMap((frame) => frame.positions))}>
          <GapEvolutionChart frames={replayFrames} />
        </ChartPanel>
        <ChartPanel title="Tyre Stint Timeline" onCsv={() => downloadCsv("tyre-stints.csv", replayFrames.flatMap((frame) => frame.tyres))}>
          <TyreStintTimeline frames={replayFrames} />
        </ChartPanel>
      </div>
      <div className="mt-4">
        <ChartPanel title="Interactive Circuit Map" subtitle="Sectors, DRS/overtaking zones, pit entry/exit placeholders" onCsv={() => downloadCsv("circuit-map.csv", circuit)}>
          <RacingLine points={circuit} title="Circuit Map" />
        </ChartPanel>
      </div>
    </AppShell>
  );
}
