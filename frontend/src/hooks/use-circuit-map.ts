"use client";

import { useQuery } from "@tanstack/react-query";

import { getCircuitMap } from "@/lib/api";

export function useCircuitMap({
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
    queryKey: ["circuit-map", season, round, session, driver],
    queryFn: () => getCircuitMap({ season, round, session, driver }),
    enabled,
    staleTime: 60_000,
    retry: 1
  });
}
