"use client";

import { createContext, useContext } from "react";

import type { RaceOption } from "@/types/f1";

export interface RaceSelection {
  season: number;
  race: RaceOption;
  driver: string;
  session: string;
  hasValidatedTelemetry: boolean;
}

const RaceSelectionContext = createContext<RaceSelection | null>(null);

export function RaceSelectionProvider({
  value,
  children
}: {
  value: RaceSelection;
  children: React.ReactNode;
}) {
  return <RaceSelectionContext.Provider value={value}>{children}</RaceSelectionContext.Provider>;
}

export function useRaceSelection() {
  const context = useContext(RaceSelectionContext);
  if (!context) {
    throw new Error("useRaceSelection must be used inside AppShell.");
  }
  return context;
}
