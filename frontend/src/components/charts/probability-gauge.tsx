"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const colors = {
  green: "#16a34a",
  amber: "#d97706",
  red: "#dc2626"
} as const;

export function ProbabilityGauge({
  title,
  value,
  tone
}: {
  title: string;
  value: number;
  tone: keyof typeof colors;
}) {
  return (
    <Plot
      data={[
        {
          type: "indicator",
          mode: "gauge+number",
          value: Math.round(value * 100),
          title: { text: title },
          gauge: {
            axis: { range: [0, 100], tickwidth: 1 },
            bar: { color: colors[tone] },
            bgcolor: "white",
            borderwidth: 0,
            steps: [
              { range: [0, 45], color: "#fee2e2" },
              { range: [45, 70], color: "#fef3c7" },
              { range: [70, 100], color: "#dcfce7" }
            ]
          }
        }
      ]}
      layout={{
        autosize: true,
        height: 220,
        margin: { l: 20, r: 20, t: 32, b: 10 },
        paper_bgcolor: "rgba(0,0,0,0)"
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: "100%" }}
    />
  );
}

