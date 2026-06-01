import * as React from "react";

import { cn } from "@/lib/utils";

export function Progress({
  className,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: number }) {
  const boundedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-sm bg-muted", className)} {...props}>
      <div className="h-full bg-accent" style={{ width: `${boundedValue}%` }} />
    </div>
  );
}

