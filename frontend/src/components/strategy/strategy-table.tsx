const rows = [
  ["Lap 22", "Medium -> Hard", "81%", "+4.1s", "Clean air after stop"],
  ["Lap 23", "Medium -> Hard", "79%", "+3.8s", "Traffic at pit exit"],
  ["Lap 24", "Medium -> Hard", "72%", "+2.9s", "Tyre crossover fading"],
  ["Lap 25", "Medium -> Soft", "61%", "+1.4s", "High degradation risk"]
];

export function StrategyTable({ title = "Strategy Comparison Table" }: { title?: string }) {
  return (
    <section className="border border-border bg-[#111418]">
      <div className="border-b border-border px-3 py-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead className="bg-[#171b21] text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              {["Pit Lap", "Strategy", "Success", "Gain", "Context"].map((header) => (
                <th key={header} className="border-b border-border px-3 py-2 text-left font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="hover:bg-[#171b21]">
                {row.map((cell) => (
                  <td key={cell} className="border-b border-border px-3 py-2 font-mono">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

