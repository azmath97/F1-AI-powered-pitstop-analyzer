import type { RaceOption } from "@/types/f1";

export function DataAvailability({ race }: { race: RaceOption }) {
  const detail =
    race.status === "cancelled"
      ? "This event was cancelled, so telemetry, pit stops, stints, and strategy model outputs are intentionally unavailable."
      : race.status === "upcoming"
        ? "This race has not happened yet. StintSync will not fabricate telemetry or strategy probabilities before validated session data exists."
        : race.hasTelemetry
          ? "Validated telemetry is available for this selection."
          : "This historical race is in the catalogue, but validated FastF1/OpenF1 telemetry has not been loaded into the local database yet.";

  return (
    <section className="mb-4 border border-border bg-[#111418] px-3 py-2">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {race.season} Round {race.round} / {race.name}
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {race.startDate} to {race.endDate}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </section>
  );
}
