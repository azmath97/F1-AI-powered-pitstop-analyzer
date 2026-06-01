export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-[#171b21] ${className}`} />;
}

