import type { RaceOption } from "@/types/f1";

export function DataAvailability({ race }: { race: RaceOption }) {
  const detail =
    race.status === "cancelled"
      ? "This event was cancelled, so telemetry, pit stops, stints, and strategy model outputs are intentionally unavailable."
      : race.status === "upcoming"
        ? "This race has not happened yet. StintSync will not fabricate telemetry or strategy probabilities before validated session data exists."
        : race.hasTelemetry
          ? "Validated telemetry is available for this selection."
          : "This completed race is in the catalogue. Pit stops can be loaded on demand from FastF1 when the backend is running; full telemetry charts require ETL-loaded database records.";

  return (
    <section className="mb-4 border border-border bg-[#111418] px-3 py-2">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {race.season} {race.round > 0 ? `Round ${race.round}` : "Cancelled event"} / {race.name}
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {race.startDate} to {race.endDate}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </section>
  );
}
