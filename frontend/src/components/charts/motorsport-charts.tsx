"use client";

import type { Data, Layout } from "plotly.js";

import { PlotlyChart } from "@/components/charts/plotly-chart";
import { getDriverColor } from "@/lib/driver-colors";
import type {
  CircuitPoint,
  CompoundComparison,
  LapEvent,
  LiveDriverState,
  PitWindowCell,
  PositionDistribution,
  ReplayFrame,
  ScenarioMatch,
  ShapFeature,
  SimulationBin,
  TelemetryPoint
} from "@/types/f1";

export function PitWindowHeatmap({ cells, height = 480 }: { cells: PitWindowCell[]; height?: number }) {
  return (
    <PlotlyChart
      height={height}
      data={[
        {
          x: cells.map((cell) => cell.lap),
          y: ["Gain", "Risk"],
          z: [cells.map((cell) => cell.expectedGain), cells.map((cell) => cell.risk * 5)],
          type: "heatmap",
          colorscale: [
            [0, "#3b1111"],
            [0.45, "#ffb300"],
            [1, "#00c853"]
          ],
          hovertemplate: "Lap %{x}<br>%{y}: %{z:.2f}<extra></extra>"
        } as Data
      ]}
      layout={{ xaxis: { title: { text: "Pit Lap" }, dtick: 2 }, yaxis: { fixedrange: true } }}
    />
  );
}

export function PitGainCurve({ cells }: { cells: PitWindowCell[] }) {
  return (
    <PlotlyChart
      height={320}
      data={[
        {
          x: cells.map((cell) => cell.lap),
          y: cells.map((cell) => cell.expectedGain),
          type: "scatter",
          mode: "lines+markers",
          line: { color: "#e10600", width: 3 },
          marker: { color: "#f5f7fa", size: 5 },
          hovertemplate: "Lap %{x}<br>Gain %{y:.2f}s<extra></extra>"
        } as Data
      ]}
      layout={{ yaxis: { title: { text: "Expected Gain (s)" } }, xaxis: { title: { text: "Lap" } } }}
    />
  );
}

export function ProbabilityGauge({ title, value }: { title: string; value: number }) {
  return (
    <PlotlyChart
      height={330}
      data={[
        {
          type: "indicator",
          mode: "gauge+number",
          value: Math.round(value * 100),
          title: { text: title },
          gauge: {
            axis: { range: [0, 100], tickcolor: "#9aa4b2" },
            bar: { color: "#e10600" },
            bgcolor: "#111418",
            bordercolor: "#252b34",
            steps: [
              { range: [0, 45], color: "#32191b" },
              { range: [45, 70], color: "#332916" },
              { range: [70, 100], color: "#13351f" }
            ]
          }
        } as Data
      ]}
      layout={{ margin: { l: 20, r: 20, t: 36, b: 10 } }}
    />
  );
}

export function TyreDegradationCurve({ points }: { points: { lap: number; actual: number; predicted: number }[] }) {
  return (
    <PlotlyChart
      height={460}
      data={[
        {
          x: points.map((point) => point.lap),
          y: points.map((point) => point.actual),
          type: "scatter",
          mode: "lines",
          name: "Actual",
          line: { color: "#f5f7fa", width: 2 }
        } as Data,
        {
          x: points.map((point) => point.lap),
          y: points.map((point) => point.predicted),
          type: "scatter",
          mode: "lines",
          name: "Predicted",
          line: { color: "#e10600", width: 3, dash: "dot" }
        } as Data
      ]}
      layout={{ yaxis: { title: { text: "Tyre Health %" }, range: [0, 105] } }}
    />
  );
}

export function CompoundComparisonChart({ compounds }: { compounds: CompoundComparison[] }) {
  return (
    <PlotlyChart
      height={300}
      data={[
        {
          x: compounds.map((compound) => compound.compound),
          y: compounds.map((compound) => compound.expectedLife),
          type: "bar",
          marker: { color: ["#e10600", "#ffb300", "#f5f7fa"] },
          hovertemplate: "%{x}<br>%{y} laps<extra></extra>"
        } as Data
      ]}
      layout={{ yaxis: { title: { text: "Expected Life" } } }}
    />
  );
}

export function ShapImportance({ features }: { features: ShapFeature[] }) {
  return (
    <PlotlyChart
      height={340}
      data={[
        {
          x: features.map((feature) => feature.value),
          y: features.map((feature) => feature.feature),
          type: "bar",
          orientation: "h",
          marker: { color: features.map((feature) => (feature.value >= 0 ? "#00c853" : "#e10600")) }
        } as Data
      ]}
      layout={{ margin: { l: 142, r: 18, t: 10, b: 34 } }}
    />
  );
}

export function ShapWaterfall({ features }: { features: ShapFeature[] }) {
  const cumulative = features.reduce<number[]>((acc, feature, index) => {
    acc.push((acc[index - 1] ?? 0) + feature.value);
    return acc;
  }, []);
  return (
    <PlotlyChart
      height={320}
      data={[
        {
          x: features.map((feature) => feature.feature),
          y: cumulative,
          type: "scatter",
          mode: "lines+markers",
          line: { color: "#ffb300", width: 2 },
          marker: { color: "#f5f7fa" }
        } as Data
      ]}
      layout={{ yaxis: { title: { text: "Cumulative Impact" } } }}
    />
  );
}

export function TelemetryTrace({
  points,
  metric,
  color,
  hoverX,
  onHover
}: {
  points: TelemetryPoint[];
  metric: "speed" | "throttle" | "brake" | "gear" | "rpm" | "drs" | "ers" | "delta";
  color: string;
  hoverX?: number;
  onHover?: (x: number) => void;
}) {
  const shape =
    hoverX === undefined
      ? []
      : [
          {
            type: "line",
            x0: hoverX,
            x1: hoverX,
            y0: 0,
            y1: 1,
            yref: "paper",
            line: { color: "#ffb300", width: 1 }
          }
        ];
  return (
    <PlotlyChart
      height={255}
      onHover={onHover}
      data={[
        {
          x: points.map((point) => point.distance),
          y: points.map((point) => point[metric]),
          type: "scatter",
          mode: "lines",
          line: { color, width: 2 },
          hovertemplate: "Distance %{x:.0f}m<br>%{y:.1f}<extra></extra>"
        } as Data
      ]}
      layout={{ shapes: shape as Partial<Layout>["shapes"], xaxis: { title: { text: "Distance (m)" } } }}
    />
  );
}

export function RacingLine({
  points,
  title = "GPS Racing Line",
  hoverX
}: {
  points: CircuitPoint[];
  title?: string;
  hoverX?: number;
}) {
  const markerIndex = hoverX === undefined ? -1 : Math.max(0, Math.min(points.length - 1, Math.round(hoverX / 26)));
  const marker = markerIndex >= 0 ? points[markerIndex] : null;
  return (
    <PlotlyChart
      height={500}
      data={[
        {
          x: points.map((point) => point.x),
          y: points.map((point) => point.y),
          mode: "lines+markers",
          type: "scatter",
          marker: {
            color: points.map((point) => point.speed),
            colorscale: [
              [0, "#2f80ed"],
              [1, "#e10600"]
            ],
            size: 5,
            showscale: true
          },
          line: { color: "#252b34", width: 1 },
          hovertemplate: "x %{x:.1f}<br>y %{y:.1f}<extra></extra>"
        } as Data,
        ...(marker
          ? [
              {
                x: [marker.x],
                y: [marker.y],
                type: "scatter",
                mode: "markers",
                marker: { color: "#ffb300", size: 14, line: { color: "#0b0d10", width: 2 } },
                hovertemplate: "Synchronized telemetry point<extra></extra>"
              } as Data
            ]
          : [])
      ]}
      layout={{ title: { text: title }, xaxis: { visible: false }, yaxis: { visible: false, scaleanchor: "x" } }}
    />
  );
}

export function SimulationHistogram({ bins }: { bins: SimulationBin[] }) {
  return (
    <PlotlyChart
      height={320}
      data={[
        {
          x: bins.map((bin) => bin.bin),
          y: bins.map((bin) => bin.count),
          type: "bar",
          marker: { color: "#e10600" }
        } as Data
      ]}
      layout={{ yaxis: { title: { text: "Sim Count" } } }}
    />
  );
}

export function PositionDistributionChart({ distribution }: { distribution: PositionDistribution[] }) {
  return (
    <PlotlyChart
      height={320}
      data={[
        {
          labels: distribution.map((item) => item.position),
          values: distribution.map((item) => item.probability),
          type: "pie",
          hole: 0.55,
          marker: { colors: ["#00c853", "#66bb6a", "#ffb300", "#f57c00", "#e10600", "#5f6875"] }
        } as Data
      ]}
      layout={{ margin: { l: 10, r: 10, t: 10, b: 10 } }}
    />
  );
}

export function RaceTimeline({ events }: { events: LapEvent[] }) {
  return (
    <PlotlyChart
      height={300}
      data={[
        {
          x: events.map((event) => event.lap),
          y: events.map((event) => event.driver),
          text: events.map((event) => event.label),
          mode: "markers",
          type: "scatter",
          marker: { size: 16, color: events.map((event) => event.type === "safety-car" ? "#ffb300" : "#e10600") },
          hovertemplate: "Lap %{x}<br>%{text}<extra></extra>"
        } as Data
      ]}
      layout={{ xaxis: { title: { text: "Lap" }, range: [0, 52] }, yaxis: { title: { text: "Event Stream" } } }}
    />
  );
}

export function PositionEvolutionChart({ frames }: { frames: ReplayFrame[] }) {
  const drivers = frames[0]?.positions.map((item) => item.driver) ?? [];
  return (
    <PlotlyChart
      height={430}
      data={drivers.map(
        (driver) =>
          ({
            x: frames.map((frame) => frame.lap),
            y: frames.map((frame) => frame.positions.find((item) => item.driver === driver)?.position ?? null),
            type: "scatter",
            mode: "lines",
            name: driver,
            line: { color: getDriverColor(driver), width: driver === "NOR" ? 4 : 2 }
          }) as Data
      )}
      layout={{
        yaxis: { title: { text: "Position" }, autorange: "reversed", dtick: 1 },
        xaxis: { title: { text: "Lap" } }
      }}
    />
  );
}

export function GapEvolutionChart({ frames }: { frames: ReplayFrame[] }) {
  const drivers = frames[0]?.positions.map((item) => item.driver) ?? [];
  return (
    <PlotlyChart
      height={360}
      data={drivers.map(
        (driver) =>
          ({
            x: frames.map((frame) => frame.lap),
            y: frames.map((frame) => frame.positions.find((item) => item.driver === driver)?.gap ?? null),
            type: "scatter",
            mode: "lines",
            name: driver,
            line: { color: getDriverColor(driver), width: driver === "NOR" ? 3 : 2 }
          }) as Data
      )}
      layout={{ yaxis: { title: { text: "Gap to leader (s)" } }, xaxis: { title: { text: "Lap" } } }}
    />
  );
}

export function TyreStintTimeline({ frames }: { frames: ReplayFrame[] }) {
  const drivers = frames[0]?.tyres.map((item) => item.driver) ?? [];
  const colors: Record<string, string> = { Soft: "#e10600", Medium: "#ffb300", Hard: "#f5f7fa" };
  return (
    <PlotlyChart
      height={330}
      data={drivers.map(
        (driver) =>
          ({
            x: frames.map((frame) => frame.lap),
            y: frames.map(() => driver),
            type: "scatter",
            mode: "markers",
            name: driver,
            marker: {
              size: 10,
              color: frames.map((frame) => colors[frame.tyres.find((item) => item.driver === driver)?.compound ?? "Hard"])
            },
            hovertemplate: "Lap %{x}<br>%{y}<extra></extra>"
          }) as Data
      )}
      layout={{ xaxis: { title: { text: "Lap" } }, yaxis: { title: { text: "Driver" } } }}
    />
  );
}

export function PaceDeltaAnalysis({ points }: { points: TelemetryPoint[] }) {
  return (
    <PlotlyChart
      height={330}
      data={[
        {
          x: points.map((point) => point.distance),
          y: points.map((point) => point.delta),
          type: "scatter",
          mode: "lines",
          fill: "tozeroy",
          line: { color: "#ffb300", width: 2 },
          hovertemplate: "Distance %{x:.0f}m<br>Delta %{y:.2f}s<extra></extra>"
        } as Data
      ]}
      layout={{ yaxis: { title: { text: "Delta (s)" } }, xaxis: { title: { text: "Distance (m)" } } }}
    />
  );
}

export function HistoricalScenarioExplorer({ scenarios }: { scenarios: ScenarioMatch[] }) {
  return (
    <PlotlyChart
      height={360}
      data={[
        {
          x: scenarios.map((scenario) => scenario.gapSeconds),
          y: scenarios.map((scenario) => scenario.gainSeconds),
          text: scenarios.map((scenario) => `${scenario.race} lap ${scenario.lap}`),
          type: "scatter",
          mode: "markers",
          marker: {
            size: scenarios.map((scenario) => 14 + scenario.similarity * 18),
            color: scenarios.map((scenario) => scenario.similarity),
            colorscale: [
              [0, "#252b34"],
              [1, "#00c853"]
            ],
            showscale: true
          },
          hovertemplate: "%{text}<br>Gap %{x:.1f}s<br>Gain %{y:.1f}s<extra></extra>"
        } as Data
      ]}
      layout={{ xaxis: { title: { text: "Gap (s)" } }, yaxis: { title: { text: "Outcome Gain (s)" } } }}
    />
  );
}

export function TrackPositionProjection({ cells }: { cells: PitWindowCell[] }) {
  return (
    <PlotlyChart
      height={350}
      data={[
        {
          x: cells.map((cell) => cell.lap),
          y: cells.map((cell) => 4 - cell.expectedGain / 2),
          type: "scatter",
          mode: "lines",
          line: { color: "#00c853", width: 3 },
          hovertemplate: "Pit lap %{x}<br>Projected P%{y:.1f}<extra></extra>"
        } as Data
      ]}
      layout={{ yaxis: { title: { text: "Projected Position" }, autorange: "reversed" }, xaxis: { title: { text: "Pit Lap" } } }}
    />
  );
}

export function LivePositionTracker({ drivers }: { drivers: LiveDriverState[] }) {
  return (
    <PlotlyChart
      height={420}
      data={[
        {
          x: drivers.map((driver) => driver.x),
          y: drivers.map((driver) => driver.y),
          text: drivers.map((driver) => `${driver.driver} P${driver.position}`),
          type: "scatter",
          mode: "text+markers",
          textposition: "top center",
          marker: {
            size: drivers.map((driver) => (driver.position === 1 ? 18 : driver.driver === "NOR" ? 16 : 12)),
            color: drivers.map((driver) => getDriverColor(driver.driver)),
            line: { color: "#0b0d10", width: 2 }
          },
          hovertemplate: "%{text}<extra></extra>"
        } as Data
      ]}
      layout={{ xaxis: { visible: false }, yaxis: { visible: false, scaleanchor: "x" } }}
    />
  );
}

export function SafetyCarImpactAnalysis({ events }: { events: LapEvent[] }) {
  return (
    <PlotlyChart
      height={310}
      data={[
        {
          x: events.map((event) => event.lap),
          y: events.map((event) => (event.type === "safety-car" || event.type === "virtual-safety-car" ? 1 : 0.25)),
          text: events.map((event) => event.label),
          type: "bar",
          marker: { color: events.map((event) => (event.type.includes("safety") ? "#ffb300" : "#252b34")) },
          hovertemplate: "Lap %{x}<br>%{text}<extra></extra>"
        } as Data
      ]}
      layout={{ yaxis: { title: { text: "Impact" }, range: [0, 1.2] }, xaxis: { title: { text: "Lap" } } }}
    />
  );
}

export function DriverComparisonOverlay({ points }: { points: TelemetryPoint[] }) {
  return (
    <PlotlyChart
      height={360}
      data={[
        {
          x: points.map((point) => point.distance),
          y: points.map((point) => point.speed),
          type: "scatter",
          mode: "lines",
          name: "NOR",
          line: { color: getDriverColor("NOR"), width: 3 }
        } as Data,
        {
          x: points.map((point) => point.distance),
          y: points.map((point, index) => point.speed - 4 + Math.sin(index / 10) * 7),
          type: "scatter",
          mode: "lines",
          name: "LEC",
          line: { color: getDriverColor("LEC"), width: 2 }
        } as Data
      ]}
      layout={{ yaxis: { title: { text: "Speed (km/h)" } }, xaxis: { title: { text: "Distance (m)" } } }}
    />
  );
}

export function StrategyConfidenceBands({ cells }: { cells: PitWindowCell[] }) {
  return (
    <PlotlyChart
      height={340}
      data={[
        {
          x: cells.map((cell) => cell.lap),
          y: cells.map((cell) => cell.expectedGain + 0.8),
          type: "scatter",
          mode: "lines",
          name: "Upper",
          line: { color: "#252b34", width: 0 },
          showlegend: false
        } as Data,
        {
          x: cells.map((cell) => cell.lap),
          y: cells.map((cell) => cell.expectedGain - 0.8),
          type: "scatter",
          mode: "lines",
          name: "Confidence band",
          fill: "tonexty",
          fillcolor: "rgba(225,6,0,0.18)",
          line: { color: "#252b34", width: 0 }
        } as Data,
        {
          x: cells.map((cell) => cell.lap),
          y: cells.map((cell) => cell.expectedGain),
          type: "scatter",
          mode: "lines",
          name: "Expected gain",
          line: { color: "#e10600", width: 3 }
        } as Data
      ]}
      layout={{ yaxis: { title: { text: "Gain (s)" } }, xaxis: { title: { text: "Pit Lap" } } }}
    />
  );
}
