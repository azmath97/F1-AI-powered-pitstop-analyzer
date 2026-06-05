"use client";

import { useRaceSelection } from "@/contexts/race-selection-context";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { DataAvailability } from "@/components/strategy/data-availability";

export default function SimulatorPage() {
  return (
    <AppShell>
      <SimulatorContent />
    </AppShell>
  );
}

function SimulatorContent() {
  const selection = useRaceSelection();
  return (
    <>
      <PageHeader title="Strategy Simulator" eyebrow={`${selection.race.name} / ${selection.driver}`} />
      <DataAvailability race={selection.race} />
      <section className="grid gap-4 xl:grid-cols-4">
        <Metric label="Inputs" value="Driver, lap, tyre age, gap, weather" />
        <Metric label="Models" value="Tyre, undercut, overcut" />
        <Metric label="Sweep" value="Pit-lap window" />
        <Metric label="Output" value="Gain, risk, confidence" />
      </section>
      <div className="mt-4">
        <EmptyState
          title="Simulator model artifacts not loaded"
          description="No Monte Carlo heatmap is shown until real undercut, overcut, and tyre-degradation models are registered. This prevents static pit-window recommendations from appearing as real strategy."
        />
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-[#111418] p-4">
      <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="metric-font mt-2 text-sm font-semibold">{value}</div>
    </div>
  );
}
