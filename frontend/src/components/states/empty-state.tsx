import { Database } from "lucide-react";

export function EmptyState({ title = "No data loaded" }: { title?: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center border border-dashed border-border bg-[#111418] text-center">
      <Database className="h-8 w-8 text-muted-foreground" />
      <div className="mt-3 font-medium">{title}</div>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Run ETL and dataset generation to replace sample analytical data.
      </p>
    </div>
  );
}

