import type { IntelligenceEntity } from "@/types/f1";

export function EntityIntelligence({ entities }: { entities: IntelligenceEntity[] }) {
  return (
    <section className="border border-border bg-[#111418]">
      <div className="grid grid-cols-[0.8fr_1fr_0.7fr_0.4fr_0.4fr] border-b border-border px-3 py-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
        <span>Name</span>
        <span>Primary Signal</span>
        <span>Secondary</span>
        <span>Score</span>
        <span>Trend</span>
      </div>
      {entities.map((entity) => (
        <div
          key={entity.id}
          className="grid grid-cols-[0.8fr_1fr_0.7fr_0.4fr_0.4fr] border-b border-border px-3 py-3 text-sm last:border-b-0"
        >
          <span className="font-semibold">{entity.name}</span>
          <span className="text-muted-foreground">{entity.primary}</span>
          <span className="text-muted-foreground">{entity.secondary}</span>
          <span className="metric-font text-foreground">{entity.score}</span>
          <span className={entity.trend >= 0 ? "text-[#00c853]" : "text-primary"}>
            {entity.trend >= 0 ? "+" : ""}
            {entity.trend.toFixed(1)}
          </span>
        </div>
      ))}
    </section>
  );
}
