"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export function StrategyHeatmap() {
  return (
    <Plot
      data={[
        {
          z: [[1.1, 2.8, 4.0, 4.3, 3.9, 2.4, 0.8]],
          x: [20, 21, 22, 23, 24, 25, 26],
          y: ["Expected gain"],
          type: "heatmap",
          colorscale: [
            [0, "#dc2626"],
            [0.45, "#facc15"],
            [1, "#16a34a"]
          ],
          showscale: false
        }
      ]}
      layout={{
        autosize: true,
        height: 260,
        margin: { l: 48, r: 16, t: 10, b: 44 },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        xaxis: { title: { text: "Pit lap" }, dtick: 1 },
        yaxis: { fixedrange: true }
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: "100%" }}
    />
  );
}
