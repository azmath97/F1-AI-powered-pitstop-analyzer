import { Gauge, LineChart, RadioTower } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <div className="text-sm font-medium text-primary">F1 Strategy Intelligence</div>
            <h1 className="text-2xl font-semibold">Race Strategy Operations</h1>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Badge variant="outline">
              <RadioTower className="h-3.5 w-3.5" />
              Historical
            </Badge>
            <Badge variant="outline">
              <Gauge className="h-3.5 w-3.5" />
              Model-ready
            </Badge>
            <Badge variant="outline">
              <LineChart className="h-3.5 w-3.5" />
              Plotly
            </Badge>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-4">{children}</div>
    </main>
  );
}

