"use client";

import type { Data, Layout } from "plotly.js";

import { PlotlyChart } from "@/components/charts/plotly-chart";
import type {
  CircuitPoint,
  CompoundComparison,
  LapEvent,
  PitWindowCell,
  PositionDistribution,
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
  metric: "speed" | "throttle" | "brake";
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

export function RacingLine({ points, title = "GPS Racing Line" }: { points: CircuitPoint[]; title?: string }) {
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
        } as Data
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
