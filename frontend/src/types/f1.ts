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

