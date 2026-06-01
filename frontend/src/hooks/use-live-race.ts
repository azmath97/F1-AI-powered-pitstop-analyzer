"use client";

import { useQuery } from "@tanstack/react-query";

import { getLiveRaceSnapshot } from "@/lib/api";

export function useLiveRace() {
  return useQuery({
    queryKey: ["live-race-session"],
    queryFn: getLiveRaceSnapshot,
    refetchInterval: 5_000,
    staleTime: 4_000
  });
}
