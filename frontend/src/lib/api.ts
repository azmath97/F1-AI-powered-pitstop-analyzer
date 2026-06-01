import axios from "axios";
import { z } from "zod";

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
