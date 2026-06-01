"use client";

import { Camera, Download } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";

export function ChartPanel({
  title,
  subtitle,
  children,
  onCsv,
  onImage,
  className = ""
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onCsv?: () => void;
  onImage?: () => void;
  className?: string;
}) {
  const panelRef = useRef<HTMLElement | null>(null);
  const capture = async () => {
    if (onImage) {
      onImage();
      return;
    }
    if (!panelRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(panelRef.current, { backgroundColor: "#0b0d10" });
    const link = document.createElement("a");
    link.download = `${title.toLowerCase().replaceAll(" ", "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
  return (
    <section ref={panelRef} className={`border border-border bg-[#111418] ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b border-border px-3 py-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="flex gap-1">
          {onCsv ? (
            <Button variant="ghost" size="icon" aria-label="Export CSV" onClick={onCsv}>
              <Download className="h-4 w-4" />
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" aria-label="Export screenshot" onClick={capture}>
            <Camera className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}
