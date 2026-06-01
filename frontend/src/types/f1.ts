export type TyreCompound = "Soft" | "Medium" | "Hard" | "Intermediate" | "Wet" | "Unknown";

export interface CommandCenterSnapshot {
  driver: string;
  team: string;
  currentLap: number;
  tyreCompound: TyreCompound;
  tyreAgeLaps: number;
  position: number;
  gapAheadMs: number | null;
  gapBehindMs: number | null;
  trackConditions: string;
  pitRecommendationLap: number | null;
  undercutProbability: number;
  overcutProbability: number;
  expectedGainMs: number;
  confidence: number;
}

export type RaceStatus = "live" | "upcoming" | "completed" | "cancelled";

export interface RaceOption {
  id: string;
  season: number;
  round: number;
  name: string;
  circuit: string;
  country: string;
  status: RaceStatus;
  sessions: string[];
  startDate: string;
  endDate: string;
  hasTelemetry: boolean;
}

export interface LiveDriverState {
  driver: string;
  team: string;
  position: number;
  gapToLeader: number;
  gapAhead: number | null;
  tyreCompound: TyreCompound;
  tyreAge: number;
  speed: number;
  throttle: number;
  brake: number;
  gear: number;
  rpm: number;
  drs: boolean;
  ers: number;
  delta: number;
  x: number;
  y: number;
  sector: 1 | 2 | 3;
}

export interface LiveRaceSnapshot {
  sessionKey: string;
  race: string;
  session: string;
  status: RaceStatus;
  currentLap: number;
  totalLaps: number;
  trackTempC: number;
  airTempC: number;
  rainfall: number;
  leader: string;
  selectedDriver: LiveDriverState;
  drivers: LiveDriverState[];
  pitRecommendationLap: number;
  undercutProbability: number;
  overcutProbability: number;
  expectedGainSeconds: number;
  confidence: number;
  risk: number;
  updatedAt: string;
}

export interface ReplayFrame {
  lap: number;
  positions: { driver: string; position: number; gap: number }[];
  tyres: { driver: string; compound: TyreCompound; age: number }[];
  pitStops: { driver: string; lap: number; stationarySeconds: number }[];
  weather: { trackTempC: number; airTempC: number; rainfall: number };
  status: string;
}

export interface StrategyRecommendation {
  race: string;
  session: string;
  driver: string;
  pitWindow: string;
  undercutProbability: number;
  overcutProbability: number;
  expectedGainSeconds: number;
  confidence: number;
  risk: number;
}

export interface PitWindowCell {
  lap: number;
  expectedGain: number;
  risk: number;
}

export interface LapEvent {
  lap: number;
  type: "start" | "pit" | "weather" | "safety-car" | "position" | "virtual-safety-car";
  label: string;
  driver: string;
}

export interface TelemetryPoint {
  distance: number;
  speed: number;
  throttle: number;
  brake: number;
  gear: number;
  rpm: number;
  drs: number;
  ers: number;
  delta: number;
  x: number;
  y: number;
}

export interface CompoundComparison {
  compound: string;
  expectedLife: number;
  paceDelta: number;
}

export interface ShapFeature {
  feature: string;
  value: number;
}

export interface SimulationBin {
  bin: string;
  count: number;
}

export interface PositionDistribution {
  position: string;
  probability: number;
}

export interface CircuitPoint {
  x: number;
  y: number;
  speed: number;
}

export interface ScenarioMatch {
  id: string;
  race: string;
  lap: number;
  compound: TyreCompound;
  gapSeconds: number;
  tyreAge: number;
  similarity: number;
  outcome: string;
  gainSeconds: number;
}

export interface IntelligenceEntity {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  score: number;
  trend: number;
}
