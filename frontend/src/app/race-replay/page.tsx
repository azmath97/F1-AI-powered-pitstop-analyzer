"use client";

import { Pause, Play } from "lucide-react";
import { useMemo, useState } from "react";

import { ChartPanel } from "@/components/charts/chart-panel";
import { downloadCsv } from "@/components/charts/plotly-chart";
import {
  GapEvolutionChart,
  PositionEvolutionChart,
  RaceTimeline,
  TyreStintTimeline
} from "@/components/charts/motorsport-charts";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { raceTimeline, replayFrames } from "@/lib/mock-data";

export default function RaceReplayPage() {
  const [playing, setPlaying] = useState(false);
  const [lap, setLap] = useState(23);
  const frame = useMemo(() => replayFrames.find((item) => item.lap === lap) ?? replayFrames[0], [lap]);

  return (
    <AppShell>
      <PageHeader title="Race Replay" eyebrow="Historical race state playback">
        <div className="font-mono text-xs text-muted-foreground">LAP {lap} / SPEED 1X</div>
      </PageHeader>
      <section className="mb-4 border border-border bg-[#111418]">
        <div className="flex flex-col gap-3 border-b border-border px-3 py-2 md:flex-row md:items-center">
          <Button variant="outline" className="border-border bg-[#171b21]" onClick={() => setPlaying((value) => !value)}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? "Pause" : "Play"}
          </Button>
          <input
            aria-label="Jump to lap"
            type="range"
            min={1}
            max={52}
            value={lap}
            onChange={(event) => setLap(Number(event.target.value))}
            className="w-full accent-[#e10600]"
          />
          <select className="h-9 border border-border bg-[#171b21] px-2 font-mono text-sm">
            <option>1x</option>
            <option>2x</option>
            <option>4x</option>
          </select>
        </div>
        <div className="grid gap-0 md:grid-cols-4">
          <ReplayMetric label="Status" value={frame.status} />
          <ReplayMetric label="Track Temp" value={`${frame.weather.trackTempC.toFixed(0)}C`} />
          <ReplayMetric label="Pits This Lap" value={`${frame.pitStops.length}`} />
          <ReplayMetric label="Leader Gap NOR" value={`${frame.positions.find((item) => item.driver === "NOR")?.gap.toFixed(1)}s`} />
        </div>
      </section>
      <div className="grid gap-4">
        <ChartPanel title="Race Position Evolution" onCsv={() => downloadCsv("position-evolution.csv", replayFrames.flatMap((item) => item.positions))}>
          <PositionEvolutionChart frames={replayFrames} />
        </ChartPanel>
        <div className="grid gap-4 xl:grid-cols-2">
          <ChartPanel title="Gap Evolution" onCsv={() => downloadCsv("gap-evolution.csv", replayFrames.flatMap((item) => item.positions))}>
            <GapEvolutionChart frames={replayFrames} />
          </ChartPanel>
          <ChartPanel title="Tyre Stint Timeline" onCsv={() => downloadCsv("tyre-stints.csv", replayFrames.flatMap((item) => item.tyres))}>
            <TyreStintTimeline frames={replayFrames} />
          </ChartPanel>
        </div>
        <ChartPanel title="Race Timeline" subtitle="Click-ready event stream for replay context">
          <RaceTimeline events={raceTimeline} />
        </ChartPanel>
      </div>
    </AppShell>
  );
}

function ReplayMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-border px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="metric-font mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
