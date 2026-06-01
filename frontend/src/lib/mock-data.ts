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
  ...[
    ["Australian GP", "Albert Park", "Australia", "2025-03-14", "2025-03-16"],
    ["Chinese GP", "Shanghai", "China", "2025-03-21", "2025-03-23"],
    ["Japanese GP", "Suzuka", "Japan", "2025-04-04", "2025-04-06"],
    ["Bahrain GP", "Sakhir", "Bahrain", "2025-04-11", "2025-04-13"],
    ["Saudi Arabian GP", "Jeddah", "Saudi Arabia", "2025-04-18", "2025-04-20"],
    ["Miami GP", "Miami", "United States", "2025-05-02", "2025-05-04"],
    ["Emilia Romagna GP", "Imola", "Italy", "2025-05-16", "2025-05-18"],
    ["Monaco GP", "Monaco", "Monaco", "2025-05-23", "2025-05-25"],
    ["Spanish GP", "Barcelona-Catalunya", "Spain", "2025-05-30", "2025-06-01"],
    ["Canadian GP", "Gilles Villeneuve", "Canada", "2025-06-13", "2025-06-15"],
    ["Austrian GP", "Red Bull Ring", "Austria", "2025-06-27", "2025-06-29"],
    ["British GP", "Silverstone", "United Kingdom", "2025-07-04", "2025-07-06"],
    ["Belgian GP", "Spa-Francorchamps", "Belgium", "2025-07-25", "2025-07-27"],
    ["Hungarian GP", "Hungaroring", "Hungary", "2025-08-01", "2025-08-03"],
    ["Dutch GP", "Zandvoort", "Netherlands", "2025-08-29", "2025-08-31"],
    ["Italian GP", "Monza", "Italy", "2025-09-05", "2025-09-07"],
    ["Azerbaijan GP", "Baku", "Azerbaijan", "2025-09-19", "2025-09-21"],
    ["Singapore GP", "Marina Bay", "Singapore", "2025-10-03", "2025-10-05"],
    ["United States GP", "Circuit of the Americas", "United States", "2025-10-17", "2025-10-19"],
    ["Mexico City GP", "Autodromo Hermanos Rodriguez", "Mexico", "2025-10-24", "2025-10-26"],
    ["Sao Paulo GP", "Interlagos", "Brazil", "2025-11-07", "2025-11-09"],
    ["Las Vegas GP", "Las Vegas Strip", "United States", "2025-11-20", "2025-11-22"],
    ["Qatar GP", "Lusail", "Qatar", "2025-11-28", "2025-11-30"],
    ["Abu Dhabi GP", "Yas Marina", "United Arab Emirates", "2025-12-05", "2025-12-07"]
  ].map(([name, circuitName, country, startDate, endDate], index) => ({
    id: `2025-${name.toLowerCase().replaceAll(" ", "-")}`,
    season: 2025,
    round: index + 1,
    name,
    circuit: circuitName,
    country,
    status: "completed" as const,
    startDate,
    endDate,
    hasTelemetry: false,
    sessions: name === "Chinese GP" || name === "Miami GP" || name === "Belgian GP" || name === "United States GP" || name === "Qatar GP"
      ? ["Practice", "Qualifying", "Sprint", "Race"]
      : ["Practice", "Qualifying", "Race"]
  })),
  ...[
    ["Australian GP", "Albert Park", "Australia", "completed", "2026-03-06", "2026-03-08"],
    ["Chinese GP", "Shanghai", "China", "completed", "2026-03-13", "2026-03-15"],
    ["Japanese GP", "Suzuka", "Japan", "completed", "2026-03-27", "2026-03-29"],
    ["Bahrain GP", "Sakhir", "Bahrain", "cancelled", "2026-04-10", "2026-04-12"],
    ["Saudi Arabian GP", "Jeddah", "Saudi Arabia", "cancelled", "2026-04-17", "2026-04-19"],
    ["Miami GP", "Miami", "United States", "completed", "2026-05-01", "2026-05-03"],
    ["Canadian GP", "Gilles Villeneuve", "Canada", "completed", "2026-05-22", "2026-05-24"],
    ["Monaco GP", "Monaco", "Monaco", "upcoming", "2026-06-05", "2026-06-07"]
  ].map(([name, circuitName, country, status, startDate, endDate], index) => ({
    id: `2026-${name.toLowerCase().replaceAll(" ", "-")}`,
    season: 2026,
    round: index + 1,
    name,
    circuit: circuitName,
    country,
    status: status as "completed" | "upcoming" | "cancelled",
    startDate,
    endDate,
    hasTelemetry: false,
    sessions: ["Practice", "Qualifying", "Race"]
  }))
];

const driversBySeason: Record<number, string[]> = {
  2025: ["VER", "TSU", "LEC", "HAM", "NOR", "PIA", "RUS", "ANT", "ALO", "STR", "GAS", "DOO", "ALB", "SAI", "HUL", "BOR", "HAD", "LAW", "OCO", "BEA"],
  2026: ["NOR", "PIA", "RUS", "ANT", "VER", "HAD", "LEC", "HAM", "ALB", "SAI", "LAW", "LIN", "ALO", "STR", "OCO", "BEA", "HUL", "BOR", "GAS", "COL", "PER", "BOT"]
};

export function getDriversForSeason(season: number) {
  return driversBySeason[season] ?? driversBySeason[2026];
}

export const driverOptions = getDriversForSeason(2026);

export function getRaceById(id: string) {
  return raceCatalogue.find((race) => race.id === id) ?? raceCatalogue.find((race) => race.status === "upcoming") ?? raceCatalogue[0];
}

export function getCircuitPointsForRace(raceId: string): CircuitPoint[] {
  const race = getRaceById(raceId);
  const seed = Array.from(race.circuit).reduce((total, char) => total + char.charCodeAt(0), 0);
  return Array.from({ length: 180 }, (_, index) => {
    const wobble = Math.sin(index / (10 + (seed % 7))) * (12 + (seed % 9));
    const xRadius = 88 + (seed % 43);
    const yRadius = 58 + (seed % 29);
    return {
      x: Math.cos(index / 28) * (xRadius + wobble),
      y: Math.sin(index / 28) * (yRadius + Math.cos(index / 17) * (seed % 18)),
      speed: 120 + Math.sin(index / (7 + (seed % 5))) * 65
    };
  });
}

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
  race: "Monaco GP",
  session: "Race",
  status: "upcoming",
  currentLap: 0,
  totalLaps: 78,
  trackTempC: 0,
  airTempC: 0,
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
