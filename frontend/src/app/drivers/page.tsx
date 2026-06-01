import { DriverComparisonOverlay, PaceDeltaAnalysis } from "@/components/charts/motorsport-charts";
import { ChartPanel } from "@/components/charts/chart-panel";
import { EntityIntelligence } from "@/components/intelligence/entity-intelligence";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { driverIntelligence, telemetry } from "@/lib/mock-data";

export default function DriversPage() {
  return (
    <AppShell>
      <PageHeader title="Drivers Intelligence" eyebrow="Driver pace and strategy signatures" />
      <div className="grid gap-4">
        <ChartPanel title="Driver Comparison Overlay">
          <DriverComparisonOverlay points={telemetry} />
        </ChartPanel>
        <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <ChartPanel title="Pace Delta Analysis">
            <PaceDeltaAnalysis points={telemetry} />
          </ChartPanel>
          <EntityIntelligence entities={driverIntelligence} />
        </div>
      </div>
    </AppShell>
  );
}
