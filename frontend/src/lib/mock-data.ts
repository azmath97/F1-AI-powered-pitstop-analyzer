import type {
  CircuitPoint,
  CompoundComparison,
  LapEvent,
  PitWindowCell,
  PositionDistribution,
  ShapFeature,
  SimulationBin,
  StrategyRecommendation,
  TelemetryPoint
} from "@/types/f1";

export const recommendation: StrategyRecommendation = {
  race: "British Grand Prix",
  session: "Race",
  driver: "NOR",
  pitWindow: "Lap 22-24",
  undercutProbability: 0.81,
  overcutProbability: 0.42,
  expectedGainSeconds: 4.1,
  confidence: 0.87,
  risk: 0.23
};

export const pitWindowHeatmap: PitWindowCell[] = Array.from({ length: 41 }, (_, index) => {
  const lap = index + 10;
  const centered = Math.exp(-Math.pow(lap - 23, 2) / 58);
  const traffic = Math.sin(lap / 2.2) * 0.8;
  return {
    lap,
    expectedGain: Number((centered * 5.2 + traffic - 1.1).toFixed(2)),
    risk: Number(Math.max(0.08, Math.min(0.92, 0.22 + Math.abs(lap - 23) / 42)).toFixed(2))
  };
});

export const raceTimeline: LapEvent[] = [
  { lap: 1, type: "start", label: "Race start", driver: "ALL" },
  { lap: 12, type: "weather", label: "Track temp +4C", driver: "ALL" },
  { lap: 18, type: "position", label: "NOR closes to 1.2s", driver: "NOR" },
  { lap: 22, type: "pit", label: "Projected pit window opens", driver: "NOR" },
  { lap: 27, type: "safety-car", label: "SC probability spike", driver: "ALL" },
  { lap: 39, type: "pit", label: "Hard tyre crossover", driver: "LEC" }
];

export const telemetry: TelemetryPoint[] = Array.from({ length: 220 }, (_, index) => {
  const distance = index * 26;
  return {
    distance,
    speed: 145 + Math.sin(index / 9) * 72 + Math.cos(index / 17) * 24,
    throttle: Math.max(0, Math.min(100, 58 + Math.sin(index / 7) * 50)),
    brake: Math.max(0, Math.min(100, Math.cos(index / 8) * 72 - 18)),
    x: Math.cos(index / 35) * (120 + Math.sin(index / 19) * 28),
    y: Math.sin(index / 35) * (70 + Math.cos(index / 21) * 18)
  };
});

export const tyreCurve = Array.from({ length: 38 }, (_, index) => ({
  lap: index + 1,
  actual: 100 - index * 1.7 - Math.max(0, index - 21) * 1.2,
  predicted: 100 - index * 1.85 - Math.max(0, index - 22) * 1.05
}));

export const compounds: CompoundComparison[] = [
  { compound: "Soft", expectedLife: 18, paceDelta: -0.7 },
  { compound: "Medium", expectedLife: 28, paceDelta: 0 },
  { compound: "Hard", expectedLife: 39, paceDelta: 0.55 }
];

export const shapFeatures: ShapFeature[] = [
  { feature: "Tyre age delta", value: 0.22 },
  { feature: "Pace advantage", value: 0.18 },
  { feature: "Traffic risk", value: -0.1 },
  { feature: "Pit lane loss", value: -0.06 },
  { feature: "Track temperature", value: 0.04 }
];

export const simulationHistogram: SimulationBin[] = Array.from({ length: 16 }, (_, index) => ({
  bin: `${index - 6}s`,
  count: Math.round(90 + Math.exp(-Math.pow(index - 9, 2) / 16) * 880)
}));

export const positionDistribution: PositionDistribution[] = [
  { position: "P1", probability: 0.18 },
  { position: "P2", probability: 0.31 },
  { position: "P3", probability: 0.15 },
  { position: "P4", probability: 0.14 },
  { position: "P5", probability: 0.13 },
  { position: "P6+", probability: 0.09 }
];

export const circuit: CircuitPoint[] = Array.from({ length: 180 }, (_, index) => ({
  x: Math.cos(index / 28) * (115 + Math.sin(index / 15) * 24),
  y: Math.sin(index / 28) * (84 + Math.cos(index / 18) * 21),
  speed: 140 + Math.sin(index / 8) * 85
}));

