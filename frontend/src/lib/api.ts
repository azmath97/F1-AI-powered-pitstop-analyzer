import axios from "axios";
import { z } from "zod";

import { liveSnapshot } from "@/lib/mock-data";
import type { LiveRaceSnapshot, SessionSummary } from "@/types/f1";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
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
  try {
    const response = await api.get("/api/v1/live/session");
    return liveRaceSnapshotSchema.parse(response.data);
  } catch {
    return {
      ...liveSnapshot,
      updatedAt: new Date().toISOString(),
      currentLap: liveSnapshot.currentLap + (new Date().getSeconds() % 3)
    };
  }
}

export async function getSessionSummary({
  season,
  round,
  session
}: {
  season: number;
  round: number;
  session: string;
}): Promise<SessionSummary> {
  const response = await api.get("/api/v1/race-data/session-summary", {
    params: { season, round, session }
  });
  return sessionSummarySchema.parse(response.data);
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
  status: z.enum(["live", "upcoming", "completed", "cancelled"]),
  currentLap: z.number(),
  totalLaps: z.number(),
  trackTempC: z.number(),
  airTempC: z.number(),
  rainfall: z.number(),
  leader: z.string(),
  selectedDriver: liveDriverStateSchema,
  drivers: z.array(liveDriverStateSchema),
  pitRecommendationLap: z.number(),
  undercutProbability: z.number(),
  overcutProbability: z.number(),
  expectedGainSeconds: z.number(),
  confidence: z.number(),
  risk: z.number(),
  updatedAt: z.string()
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
  pitStops: z.array(pitStopSummarySchema)
});
