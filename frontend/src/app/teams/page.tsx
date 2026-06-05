import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";

export default function TeamsPage() {
  return (
    <AppShell>
      <PageHeader title="Teams" eyebrow="De-scoped route" />
      <EmptyState
        title="Team analytics moved out of scope"
        description="The active product now focuses on pit stops, tyre stints, undercut, overcut, and simulation. No static team strategy charts are shown."
      />
    </AppShell>
  );
}
