"use client";

import { useQuery } from "@tanstack/react-query";

import { getSessionSummary } from "@/lib/api";

export function useSessionSummary({
  season,
  round,
  session,
  enabled
}: {
  season: number;
  round: number;
  session: string;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: ["session-summary", season, round, session],
    queryFn: () => getSessionSummary({ season, round, session }),
    enabled,
    staleTime: 60_000,
    retry: 1
  });
}
