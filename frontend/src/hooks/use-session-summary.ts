"use client";

import { useQuery } from "@tanstack/react-query";

import { getSessionSummary } from "@/lib/api";

export function useSessionSummary({
  season,
  round,
  session,
  driver,
  enabled
}: {
  season: number;
  round: number;
  session: string;
  driver: string;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: ["session-summary", season, round, session, driver],
    queryFn: () => getSessionSummary({ season, round, session, driver }),
    enabled,
    staleTime: 60_000,
    retry: 1
  });
}
