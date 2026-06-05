import { getDriverColor } from "@/lib/driver-colors";
import type { PitStopSummary } from "@/types/f1";

export function PitStopTable({
  pitStops,
  season = 2026,
  selectedDriver,
  title = "FastF1 Pit Stops"
}: {
  pitStops: PitStopSummary[];
  season?: number;
  selectedDriver?: string;
  title?: string;
}) {
  return (
    <section className="border border-border bg-[#111418]">
      <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
        {title}
      </div>
      {pitStops.length === 0 ? (
        <div className="px-3 py-8 text-center text-sm text-muted-foreground">
          No verified race pit stops for this driver/session.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[0.45fr_0.4fr_0.4fr_0.7fr_0.7fr_0.8fr_0.8fr] border-b border-border px-3 py-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <span>Driver</span>
            <span>Lap</span>
            <span>Stop</span>
            <span>From</span>
            <span>To</span>
            <span>Pit In</span>
            <span>Pit Out</span>
          </div>
          {pitStops.map((stop) => (
            <div
              key={`${stop.driver}-${stop.stopNumber}-${stop.lap}`}
              className={`grid grid-cols-[0.45fr_0.4fr_0.4fr_0.7fr_0.7fr_0.8fr_0.8fr] border-b px-3 py-2 text-sm last:border-b-0 ${
                selectedDriver === stop.driver ? "border-l-2 border-l-primary bg-[#171b21]" : "border-border"
              }`}
            >
              <span className="font-mono font-semibold" style={{ color: getDriverColor(stop.driver, season) }}>
                {stop.driver}
              </span>
              <span>{stop.lap}</span>
              <span>{stop.stopNumber}</span>
              <span className="truncate text-muted-foreground">{stop.compoundBefore ?? "-"}</span>
              <span className="truncate text-muted-foreground">{stop.compoundAfter ?? "-"}</span>
              <span className="truncate text-muted-foreground">{stop.pitInTime ?? "-"}</span>
              <span className="truncate text-muted-foreground">{stop.pitOutTime ?? "-"}</span>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
