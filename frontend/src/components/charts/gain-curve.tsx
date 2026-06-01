"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const pitLaps = [20, 21, 22, 23, 24, 25, 26];
const gains = [1.1, 2.8, 4.0, 4.3, 3.9, 2.4, 0.8];

export function GainCurve() {
  return (
    <Plot
      data={[
        {
          x: pitLaps,
          y: gains,
          type: "scatter",
          mode: "lines+markers",
          line: { color: "#16a34a", width: 3 },
          marker: { color: "#111827", size: 7 },
          name: "Expected gain"
        }
      ]}
      layout={{
        autosize: true,
        height: 300,
        margin: { l: 48, r: 16, t: 12, b: 44 },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        xaxis: { title: { text: "Pit lap" }, dtick: 1, gridcolor: "#e5e7eb" },
        yaxis: { title: { text: "Gain (s)" }, gridcolor: "#e5e7eb" },
        showlegend: false
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: "100%" }}
    />
  );
}
