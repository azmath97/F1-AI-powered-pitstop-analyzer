import { Activity, Flag, Gauge, RadioTower, Timer } from "lucide-react";

import { GainCurve } from "@/components/charts/gain-curve";
import { ProbabilityGauge } from "@/components/charts/probability-gauge";
import { StrategyHeatmap } from "@/components/charts/strategy-heatmap";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CommandCenterSnapshot } from "@/types/f1";

const snapshot: CommandCenterSnapshot = {
  driver: "Lando Norris",
  team: "McLaren",
  currentLap: 22,
  tyreCompound: "Medium",
  tyreAgeLaps: 22,
  position: 2,
  gapAheadMs: 1240,
  gapBehindMs: 5300,
  trackConditions: "Dry",
  pitRecommendationLap: 23,
  undercutProbability: 0.81,
  overcutProbability: 0.42,
  expectedGainMs: 4300,
  confidence: 0.87
};

export default function Home() {
  return (
    <AppShell>
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Strategy Command Center</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {snapshot.driver} - {snapshot.team}
              </p>
            </div>
            <Badge>Lap {snapshot.currentLap}</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric icon={Flag} label="Position" value={`P${snapshot.position}`} />
              <Metric icon={Timer} label="Pit Lap" value={`${snapshot.pitRecommendationLap}`} />
              <Metric icon={Gauge} label="Tyre" value={`${snapshot.tyreCompound} ${snapshot.tyreAgeLaps}L`} />
              <Metric icon={RadioTower} label="Track" value={snapshot.trackConditions} />
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <ProbabilityGauge title="Undercut" value={snapshot.undercutProbability} tone="green" />
              <ProbabilityGauge title="Overcut" value={snapshot.overcutProbability} tone="amber" />
              <Card className="bg-muted/40">
                <CardHeader>
                  <CardTitle>Confidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{Math.round(snapshot.confidence * 100)}%</div>
                  <Progress value={snapshot.confidence * 100} className="mt-4" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Expected gain {(snapshot.expectedGainMs / 1000).toFixed(1)}s
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pit Window Optimizer</CardTitle>
          </CardHeader>
          <CardContent>
            <StrategyHeatmap />
          </CardContent>
        </Card>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Gain Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <GainCurve />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tyre Degradation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <ProbabilityGauge title="Health" value={0.43} tone="red" />
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3 text-sm">
                  <span className="text-muted-foreground">Remaining laps</span>
                  <span className="font-semibold">6.5</span>
                </div>
                <div className="flex items-center justify-between border-b pb-3 text-sm">
                  <span className="text-muted-foreground">Performance loss</span>
                  <span className="font-semibold">+1.85s</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Traffic risk</span>
                  <span className="font-semibold">22%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function Metric({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}
