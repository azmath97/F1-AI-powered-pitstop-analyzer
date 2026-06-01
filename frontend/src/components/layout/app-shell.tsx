"use client";

import {
  Activity,
  CircuitBoard,
  Flag,
  Gauge,
  GitCompare,
  LayoutDashboard,
  Moon,
  RadioTower,
  Route,
  Sun,
  TimerReset
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/race-analysis", label: "Race Analysis", icon: Flag },
  { href: "/telemetry", label: "Telemetry", icon: Activity },
  { href: "/tyres", label: "Tyres", icon: Gauge },
  { href: "/undercut", label: "Undercut", icon: GitCompare },
  { href: "/overcut", label: "Overcut", icon: Route },
  { href: "/simulator", label: "Simulator", icon: TimerReset }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [light, setLight] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
  }, [light]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r bg-[#0b0d10] lg:block">
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            <CircuitBoard className="h-4 w-4" />
            Strategy Ops
          </div>
          <div className="mt-2 text-xl font-semibold">F1 Intelligence</div>
        </div>
        <nav className="space-y-1 p-3" aria-label="Primary">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 border border-transparent px-3 py-2 text-sm text-muted-foreground outline-none transition-colors focus-visible:border-primary",
                  active
                    ? "border-border bg-[#171b21] text-foreground"
                    : "hover:border-border hover:bg-[#111418] hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 text-xs text-muted-foreground">
          <div className="font-mono text-foreground">MLFLOW: ONLINE</div>
          <div>Supabase + Render target</div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-[#0b0d10]/95 backdrop-blur">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <RadioTower className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Race Engineering Workspace</div>
                <div className="font-mono text-sm text-foreground">SILVERSTONE / RACE / LAP 22</div>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Select label="Race" values={["British GP", "Monaco GP", "Italian GP"]} />
              <Select label="Driver" values={["NOR", "VER", "LEC"]} />
              <Select label="Session" values={["Race", "Qualifying", "Sprint", "FP2"]} />
              <Button
                variant="outline"
                className="h-9 border-border bg-[#111418]"
                onClick={() => setLight((value) => !value)}
                aria-label="Toggle theme"
              >
                {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Theme
              </Button>
            </div>
          </div>
        </header>
        <main className="px-4 py-4 xl:px-6">{children}</main>
      </div>
    </div>
  );
}

function Select({ label, values }: { label: string; values: string[] }) {
  return (
    <label className="grid gap-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
      {label}
      <select className="h-9 min-w-36 border border-border bg-[#111418] px-2 font-mono text-sm text-foreground outline-none focus:border-primary">
        {values.map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>
    </label>
  );
}

