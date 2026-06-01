"use client";

import { RadioTower } from "lucide-react";

import type { LiveRaceSnapshot } from "@/types/f1";

export function LiveRacePanel({ snapshot }: { snapshot: LiveRaceSnapshot }) {
  const driver = snapshot.selectedDriver;
  return (
    <section className="border border-border bg-[#111418]">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Live Session
        </div>
        <div className="font-mono text-xs text-muted-foreground">{new Date(snapshot.updatedAt).toLocaleTimeString()}</div>
      </div>
      <div className="grid gap-0 md:grid-cols-3 xl:grid-cols-6">
        <LiveMetric label="Lap" value={`${snapshot.currentLap}/${snapshot.totalLaps}`} />
        <LiveMetric label="Position" value={`P${driver.position}`} />
        <LiveMetric label="Gap Ahead" value={driver.gapAhead === null ? "Leader" : `${driver.gapAhead.toFixed(1)}s`} />
        <LiveMetric label="Tyre" value={`${driver.tyreCompound} ${driver.tyreAge}L`} />
        <LiveMetric label="Pit Rec" value={`Lap ${snapshot.pitRecommendationLap}`} />
        <LiveMetric label="Expected Gain" value={`+${snapshot.expectedGainSeconds.toFixed(1)}s`} />
      </div>
      <div className="grid gap-0 border-t border-border md:grid-cols-4">
        <LiveMetric label="Undercut" value={`${Math.round(snapshot.undercutProbability * 100)}%`} />
        <LiveMetric label="Overcut" value={`${Math.round(snapshot.overcutProbability * 100)}%`} />
        <LiveMetric label="Confidence" value={`${Math.round(snapshot.confidence * 100)}%`} />
        <LiveMetric label="Track" value={`${snapshot.trackTempC.toFixed(0)}C`} />
      </div>
    </section>
  );
}

export function LiveTelemetryStrip({ snapshot }: { snapshot: LiveRaceSnapshot }) {
  const driver = snapshot.selectedDriver;
  const metrics = [
    ["Speed", `${driver.speed} km/h`],
    ["Throttle", `${driver.throttle}%`],
    ["Brake", `${driver.brake}%`],
    ["Gear", `${driver.gear}`],
    ["RPM", driver.rpm.toLocaleString()],
    ["DRS", driver.drs ? "OPEN" : "CLOSED"],
    ["ERS", `${driver.ers}%`],
    ["Delta", `${driver.delta > 0 ? "+" : ""}${driver.delta.toFixed(2)}s`]
  ];
  return (
    <section className="border border-border bg-[#111418]">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
        <RadioTower className="h-4 w-4 text-primary" />
        Live Telemetry
      </div>
      <div className="grid grid-cols-2 gap-0 md:grid-cols-4 xl:grid-cols-8">
        {metrics.map(([label, value]) => (
          <LiveMetric key={label} label={label} value={value} compact />
        ))}
      </div>
    </section>
  );
}

function LiveMetric({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={`border-border px-3 py-2 ${compact ? "border-r" : "border-r"}`}>
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="metric-font mt-1 text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}
