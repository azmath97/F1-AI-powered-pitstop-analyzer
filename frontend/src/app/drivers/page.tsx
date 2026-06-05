import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";

export default function DriversPage() {
  return (
    <AppShell>
      <PageHeader title="Drivers" eyebrow="De-scoped route" />
      <EmptyState
        title="Driver analytics moved out of scope"
        description="The active product now focuses on pit stops, tyre stints, undercut, overcut, and simulation. No static driver pace charts are shown."
      />
    </AppShell>
  );
}
