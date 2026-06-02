const driverTeams: Record<number, Record<string, string>> = {
  2025: {
    VER: "red-bull",
    TSU: "red-bull",
    LEC: "ferrari",
    HAM: "ferrari",
    NOR: "mclaren",
    PIA: "mclaren",
    RUS: "mercedes",
    ANT: "mercedes",
    ALO: "aston-martin",
    STR: "aston-martin",
    GAS: "alpine",
    DOO: "alpine",
    ALB: "williams",
    SAI: "williams",
    HUL: "sauber",
    BOR: "sauber",
    HAD: "racing-bulls",
    LAW: "racing-bulls",
    OCO: "haas",
    BEA: "haas"
  },
  2026: {
    NOR: "mclaren",
    PIA: "mclaren",
    RUS: "mercedes",
    ANT: "mercedes",
    VER: "red-bull",
    HAD: "red-bull",
    LEC: "ferrari",
    HAM: "ferrari",
    ALB: "williams",
    SAI: "williams",
    LAW: "racing-bulls",
    LIN: "racing-bulls",
    ALO: "aston-martin",
    STR: "aston-martin",
    OCO: "haas",
    BEA: "haas",
    HUL: "sauber",
    BOR: "sauber",
    GAS: "alpine",
    COL: "alpine",
    PER: "cadillac",
    BOT: "cadillac"
  }
};

const teamColors: Record<string, string> = {
  "mclaren": "#ff8000",
  "ferrari": "#e8002d",
  "red-bull": "#3671c6",
  "mercedes": "#00d2be",
  "aston-martin": "#006f62",
  "alpine": "#0090ff",
  "williams": "#64c4ff",
  "sauber": "#52e252",
  "racing-bulls": "#6692ff",
  "haas": "#b6babd",
  "cadillac": "#d4af37",
  "unknown": "#9aa4b2"
};

export function getDriverTeam(driver: string, season = 2026) {
  return driverTeams[season]?.[driver] ?? driverTeams[2026]?.[driver] ?? "unknown";
}

export function getDriverColor(driver: string, season = 2026) {
  return teamColors[getDriverTeam(driver, season)] ?? teamColors.unknown;
}
