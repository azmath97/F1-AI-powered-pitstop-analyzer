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
  type: "start" | "pit" | "weather" | "safety-car" | "position";
  label: string;
  driver: string;
}

export interface TelemetryPoint {
  distance: number;
  speed: number;
  throttle: number;
  brake: number;
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
