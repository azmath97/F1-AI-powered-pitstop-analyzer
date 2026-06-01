"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center border border-border bg-[#111418] p-8 text-center">
      <div className="text-xs uppercase tracking-[0.2em] text-primary">Runtime fault</div>
      <h1 className="mt-3 text-xl font-semibold">Dashboard module failed</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{error.message}</p>
      <Button className="mt-5" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}

