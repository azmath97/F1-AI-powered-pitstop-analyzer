import axios from "axios";
import { z } from "zod";

import type { CircuitMapSummary, LiveRaceSnapshot, SessionSummary } from "@/types/f1";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json"
  }
});

export async function apiGet<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

export const strategyProbabilitySchema = z.object({
  model_name: z.string(),
  model_version: z.string(),
  probability: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  feature_snapshot: z.record(z.unknown())
});

export async function postTyped<TResponse>(
  path: string,
  body: unknown,
  schema: z.ZodType<TResponse>
): Promise<TResponse> {
  const response = await api.post(path, body);
  return schema.parse(response.data);
}

export async function getLiveRaceSnapshot(): Promise<LiveRaceSnapshot> {
  const response = await api.get("/api/v1/live/session");
  return liveRaceSnapshotSchema.parse(response.data);
}

export async function getSessionSummary({
  season,
  round,
  session,
  driver
}: {
  season: number;
  round: number;
  session: string;
  driver: string;
}): Promise<SessionSummary> {
  const response = await api.get("/api/v1/race-data/session-summary", {
    params: { season, round, session, driver },
    timeout: 120_000
  });
  return sessionSummarySchema.parse(response.data);
}

export async function getCircuitMap({
  season,
  round,
  session,
  driver
}: {
  season: number;
  round: number;
  session: string;
  driver: string;
}): Promise<CircuitMapSummary> {
  const response = await api.get("/api/v1/race-data/circuit-map", {
    params: { season, round, session, driver },
    timeout: 120_000
  });
  return circuitMapSummarySchema.parse(response.data);
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (error.code === "ECONNABORTED") {
      return "The backend is still loading the FastF1 session. Try again after the first cache warm-up finishes.";
    }
    if (!error.response) {
      return "The FastAPI backend is not reachable from the frontend.";
    }
    return `API request failed with status ${error.response.status}.`;
  }
  return error instanceof Error ? error.message : "Unknown API error.";
}

const liveDriverStateSchema = z.object({
  driver: z.string(),
  team: z.string(),
  position: z.number(),
  gapToLeader: z.number(),
  gapAhead: z.number().nullable(),
  tyreCompound: z.enum(["Soft", "Medium", "Hard", "Intermediate", "Wet", "Unknown"]),
  tyreAge: z.number(),
  speed: z.number(),
  throttle: z.number(),
  brake: z.number(),
  gear: z.number(),
  rpm: z.number(),
  drs: z.boolean(),
  ers: z.number(),
  delta: z.number(),
  x: z.number(),
  y: z.number(),
  sector: z.union([z.literal(1), z.literal(2), z.literal(3)])
});

const liveRaceSnapshotSchema = z.object({
  sessionKey: z.string(),
  race: z.string(),
  session: z.string(),
  sessionType: z.string().optional().nullable(),
  status: z.enum(["live", "upcoming", "completed", "cancelled"]),
  currentLap: z.number(),
  totalLaps: z.number(),
  trackTempC: z.number(),
  airTempC: z.number(),
  rainfall: z.number(),
  leader: z.string().optional().nullable(),
  selectedDriver: liveDriverStateSchema.optional().nullable(),
  drivers: z.array(liveDriverStateSchema),
  pitRecommendationLap: z.number().optional().nullable(),
  undercutProbability: z.number().optional().nullable(),
  overcutProbability: z.number().optional().nullable(),
  expectedGainSeconds: z.number().optional().nullable(),
  confidence: z.number().optional().nullable(),
  risk: z.number().optional().nullable(),
  updatedAt: z.string(),
  reason: z.string().optional().nullable()
});

const pitStopSummarySchema = z.object({
  driver: z.string(),
  lap: z.number(),
  stopNumber: z.number(),
  compoundBefore: z.enum(["Soft", "Medium", "Hard", "Intermediate", "Wet", "Unknown"]).optional().nullable(),
  compoundAfter: z.enum(["Soft", "Medium", "Hard", "Intermediate", "Wet", "Unknown"]).optional().nullable(),
  pitInTime: z.string().optional().nullable(),
  pitOutTime: z.string().optional().nullable()
});

const sessionSummarySchema = z.object({
  season: z.number(),
  round: z.number(),
  raceName: z.string(),
  session: z.string(),
  source: z.enum(["fastf1", "database"]),
  selectedDriver: z.string().optional().nullable(),
  totalPitStops: z.number(),
  driversWithPitStops: z.array(z.string()),
  pitStops: z.array(pitStopSummarySchema),
  selectedDriverPitStops: z.array(pitStopSummarySchema)
});

const circuitMapPointSchema = z.object({
  x: z.number(),
  y: z.number(),
  speed: z.number().optional().nullable(),
  distance: z.number().optional().nullable()
}).transform((point) => ({
  x: point.x,
  y: point.y,
  speed: point.speed ?? 0
}));

const circuitMapSummarySchema = z.object({
  season: z.number(),
  round: z.number(),
  raceName: z.string(),
  session: z.string(),
  driver: z.string(),
  source: z.enum(["fastf1", "database"]),
  points: z.array(circuitMapPointSchema)
});
