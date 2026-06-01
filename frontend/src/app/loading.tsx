import { SkeletonBlock } from "@/components/states/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-4">
      <SkeletonBlock className="h-24" />
      <SkeletonBlock className="h-[520px]" />
      <SkeletonBlock className="h-64" />
    </div>
  );
}

