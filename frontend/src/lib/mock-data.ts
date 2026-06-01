import type {
  CircuitPoint,
  CompoundComparison,
  IntelligenceEntity,
  LapEvent,
  LiveRaceSnapshot,
  PitWindowCell,
  PositionDistribution,
  RaceOption,
  ReplayFrame,
  ScenarioMatch,
  ShapFeature,
  SimulationBin,
  StrategyRecommendation,
  TelemetryPoint
} from "@/types/f1";

export const raceCatalogue: RaceOption[] = [
  {
    id: "2025-british-gp",
    season: 2025,
    round: 12,
    name: "British GP",
    circuit: "Silverstone",
    country: "United Kingdom",
    status: "completed",
    sessions: ["Practice", "Qualifying", "Sprint", "Race"]
  },
  {
    id: "2026-bahrain-gp",
    season: 2026,
    round: 1,
    name: "Bahrain GP",
    circuit: "Sakhir",
    country: "Bahrain",
    status: "live",
    sessions: ["Practice", "Qualifying", "Race"]
  },
  {
    id: "2026-saudi-arabian-gp",
    season: 2026,
    round: 2,
    name: "Saudi Arabian GP",
    circuit: "Jeddah",
    country: "Saudi Arabia",
    status: "upcoming",
    sessions: ["Practice", "Qualifying", "Race"]
  }
];

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
  const brake = Math.max(0, Math.min(100, Math.cos(index / 8) * 72 - 18));
  const speed = 145 + Math.sin(index / 9) * 72 + Math.cos(index / 17) * 24;
  return {
    distance,
    speed,
    throttle: Math.max(0, Math.min(100, 58 + Math.sin(index / 7) * 50)),
    brake,
    gear: Math.max(1, Math.min(8, Math.round(speed / 42))),
    rpm: Math.round(9400 + speed * 18 - brake * 22),
    drs: index % 54 > 17 && index % 54 < 42 ? 1 : 0,
    ers: Math.max(12, Math.min(98, 78 - index * 0.16 + Math.sin(index / 11) * 9)),
    delta: Number((Math.sin(index / 15) * 0.42 + Math.cos(index / 31) * 0.18).toFixed(2)),
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

export const liveSnapshot: LiveRaceSnapshot = {
  sessionKey: "openf1-live-2026-bahrain-race",
  race: "Bahrain GP",
  session: "Race",
  status: "live",
  currentLap: 22,
  totalLaps: 57,
  trackTempC: 38,
  airTempC: 27,
  rainfall: 0,
  leader: "VER",
  pitRecommendationLap: 24,
  undercutProbability: 0.81,
  overcutProbability: 0.42,
  expectedGainSeconds: 4.1,
  confidence: 0.87,
  risk: 0.23,
  updatedAt: new Date().toISOString(),
  selectedDriver: {
    driver: "NOR",
    team: "McLaren",
    position: 3,
    gapToLeader: 5.8,
    gapAhead: 1.2,
    tyreCompound: "Medium",
    tyreAge: 18,
    speed: 291,
    throttle: 92,
    brake: 0,
    gear: 8,
    rpm: 11840,
    drs: true,
    ers: 61,
    delta: -0.18,
    x: 64,
    y: -28,
    sector: 2
  },
  drivers: ["VER", "LEC", "NOR", "HAM", "PIA", "RUS", "SAI", "ALO"].map((driver, index) => ({
    driver,
    team: ["Red Bull", "Ferrari", "McLaren", "Ferrari", "McLaren", "Mercedes", "Williams", "Aston Martin"][index],
    position: index + 1,
    gapToLeader: Number((index * 2.6 + Math.sin(index) * 0.7).toFixed(1)),
    gapAhead: index === 0 ? null : Number((1.1 + Math.cos(index) * 0.35).toFixed(1)),
    tyreCompound: index % 3 === 0 ? "Hard" : index % 3 === 1 ? "Soft" : "Medium",
    tyreAge: 11 + index * 2,
    speed: Math.round(242 + Math.sin(index * 1.7) * 48),
    throttle: Math.round(64 + Math.cos(index) * 28),
    brake: Math.max(0, Math.round(Math.sin(index * 1.2) * 45)),
    gear: Math.max(2, Math.min(8, 5 + (index % 4))),
    rpm: 10100 + index * 210,
    drs: index > 0 && index < 4,
    ers: 72 - index * 4,
    delta: Number((Math.sin(index / 2) * 0.4).toFixed(2)),
    x: Math.cos(index / 8 * Math.PI * 2) * 112,
    y: Math.sin(index / 8 * Math.PI * 2) * 70,
    sector: ((index % 3) + 1) as 1 | 2 | 3
  }))
};

export const replayFrames: ReplayFrame[] = Array.from({ length: 52 }, (_, index) => ({
  lap: index + 1,
  positions: ["VER", "LEC", "NOR", "HAM", "PIA", "RUS"].map((driver, driverIndex) => ({
    driver,
    position: Math.max(1, driverIndex + 1 + (index > 24 && driver === "NOR" ? -1 : 0)),
    gap: Number((driverIndex * 1.9 + index * 0.08 + Math.sin(index / 7 + driverIndex) * 0.55).toFixed(1))
  })),
  tyres: ["VER", "LEC", "NOR", "HAM", "PIA", "RUS"].map((driver, driverIndex) => ({
    driver,
    compound: index < 22 ? "Medium" : driverIndex % 2 === 0 ? "Hard" : "Soft",
    age: index < 22 ? index + 1 : index - 21
  })),
  pitStops: index === 23 ? [{ driver: "NOR", lap: 23, stationarySeconds: 2.4 }] : [],
  weather: { trackTempC: 36 + Math.sin(index / 8) * 3, airTempC: 26, rainfall: 0 },
  status: index === 27 ? "Virtual Safety Car" : "Green"
}));

export const scenarioMatches: ScenarioMatch[] = [
  { id: "sim-001", race: "2025 British GP", lap: 23, compound: "Medium", gapSeconds: 1.2, tyreAge: 18, similarity: 0.94, outcome: "Undercut gained P2", gainSeconds: 3.8 },
  { id: "sim-002", race: "2024 Austrian GP", lap: 21, compound: "Medium", gapSeconds: 1.6, tyreAge: 16, similarity: 0.89, outcome: "Held position", gainSeconds: 0.7 },
  { id: "sim-003", race: "2023 Dutch GP", lap: 25, compound: "Soft", gapSeconds: 0.9, tyreAge: 13, similarity: 0.85, outcome: "Overcut failed in traffic", gainSeconds: -1.4 }
];

export const driverIntelligence: IntelligenceEntity[] = [
  { id: "nor", name: "Lando Norris", primary: "Tyre preservation", secondary: "High undercut conversion", score: 91, trend: 4.2 },
  { id: "ver", name: "Max Verstappen", primary: "Opening stint pace", secondary: "Low degradation variance", score: 94, trend: 1.6 },
  { id: "lec", name: "Charles Leclerc", primary: "Qualifying offset", secondary: "Track position sensitivity", score: 88, trend: -0.9 }
];

export const teamIntelligence: IntelligenceEntity[] = [
  { id: "mclaren", name: "McLaren", primary: "Pit window agility", secondary: "Strong medium tyre life", score: 90, trend: 5.1 },
  { id: "ferrari", name: "Ferrari", primary: "Straight-line defence", secondary: "Warm-up limited", score: 84, trend: 2.4 },
  { id: "mercedes", name: "Mercedes", primary: "Long-run stability", secondary: "Traffic exposure risk", score: 82, trend: -1.2 }
];

export const circuitIntelligence: IntelligenceEntity[] = [
  { id: "silverstone", name: "Silverstone", primary: "High-speed degradation", secondary: "Undercut window lap 21-25", score: 87, trend: 2.8 },
  { id: "sakhir", name: "Bahrain", primary: "Rear-limited traction", secondary: "Two-stop bias", score: 92, trend: 3.6 },
  { id: "monaco", name: "Monaco", primary: "Track position lock", secondary: "Safety-car leverage", score: 78, trend: -0.4 }
];
