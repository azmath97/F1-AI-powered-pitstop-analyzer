"use client";

import dynamic from "next/dynamic";

import type { Config, Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const baseLayout: Partial<Layout> = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { color: "#f5f7fa", family: "Inter, Arial, sans-serif", size: 11 },
  margin: { l: 48, r: 18, t: 16, b: 42 },
  xaxis: { gridcolor: "#252b34", zerolinecolor: "#252b34" },
  yaxis: { gridcolor: "#252b34", zerolinecolor: "#252b34" },
  legend: { orientation: "h", y: -0.22 }
};

const baseConfig: Partial<Config> = {
  displaylogo: false,
  responsive: true,
  modeBarButtonsToRemove: ["lasso2d", "select2d"]
};

export function PlotlyChart({
  data,
  layout,
  height = 420,
  onHover,
  divId
}: {
  data: Data[];
  layout?: Partial<Layout>;
  height?: number;
  onHover?: (x: number) => void;
  divId?: string;
}) {
  return (
    <Plot
      divId={divId}
      data={data}
      layout={{ ...baseLayout, ...layout, height, autosize: true }}
      config={baseConfig}
      onHover={(event) => {
        const point = event.points?.[0];
        if (point?.x !== undefined && onHover) {
          onHover(Number(point.x));
        }
      }}
      style={{ width: "100%" }}
      useResizeHandler
    />
  );
}

export function downloadCsv<T extends object>(filename: string, rows: T[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0] as Record<string, unknown>);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => JSON.stringify((row as Record<string, unknown>)[header] ?? ""))
        .join(",")
    )
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
