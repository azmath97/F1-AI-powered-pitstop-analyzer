"use client";

import { useRaceSelection } from "@/contexts/race-selection-context";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { DataAvailability } from "@/components/strategy/data-availability";

export default function TyresPage() {
  return (
    <AppShell>
      <TyresContent />
    </AppShell>
  );
}

function TyresContent() {
  const selection = useRaceSelection();
  return (
    <>
      <PageHeader title="Tyre Stint & Degradation" eyebrow={`${selection.race.name} / ${selection.driver}`} />
      <DataAvailability race={selection.race} />
      <section className="grid gap-4 xl:grid-cols-3">
        <FocusPanel title="Tyre Age" body="Uses compact lap and stint records: compound, lap start, lap end, pit-in lap, and pit-out lap." />
        <FocusPanel title="Degradation" body="Requires verified lap pace by stint after fuel, traffic, weather, and safety-car context are normalized." />
        <FocusPanel title="Remaining Life" body="Disabled until the LightGBM RUL model has trained artifacts and real feature rows for this race/driver." />
      </section>
      <div className="mt-4">
        <EmptyState
          title="Tyre model data not loaded"
          description="No static degradation curve is shown. Run the pit-stop/stint ETL and model training before tyre health, compound comparison, or remaining-life predictions appear."
        />
      </div>
    </>
  );
}

function FocusPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-border bg-[#111418] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{title}</div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}
