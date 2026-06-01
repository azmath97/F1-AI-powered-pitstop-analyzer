export function StrategyExplainer({
  mode,
  children
}: {
  mode: "undercut" | "overcut" | "pit";
  children?: React.ReactNode;
}) {
  const content = {
    undercut: {
      title: "Undercut",
      body:
        "An undercut is an early stop designed to use fresh-tyre pace to jump a rival who stays out. It only works when the out-lap advantage is greater than pit-lane loss, traffic risk, tyre warm-up loss, and the rival's response lap."
    },
    overcut: {
      title: "Overcut",
      body:
        "An overcut keeps the car out longer to use clean air, avoid traffic, or wait for the rival to struggle on cold tyres after stopping. It is strongest when the current tyres still have stable pace and the track is improving."
    },
    pit: {
      title: "Pit Window",
      body:
        "A professional pit recommendation is not just the fastest lap to stop. It combines degradation, gaps, traffic, pit-lane loss, safety-car exposure, tyre availability, and the probability of rejoining in clean air."
    }
  }[mode];

  return (
    <section className="border border-border bg-[#111418] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{content.title}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{content.body}</p>
      {children ? <div className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">{children}</div> : null}
    </section>
  );
}
