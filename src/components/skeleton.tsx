"use client";

export function SkeletonLine({ width = "100%", height = "12px" }: { width?: string; height?: string }) {
  return <div className="shimmer rounded-lg" style={{ width, height }} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/[0.06]" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-1/2 rounded bg-white/[0.06]" />
          <div className="h-2.5 w-1/3 rounded bg-white/[0.04]" />
        </div>
      </div>
      <div className="h-8 w-20 rounded-lg bg-white/[0.06]" />
      <div className="h-2.5 w-full rounded bg-white/[0.04]" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3 sm:p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-white/[0.06]" />
        <div className="h-3 w-12 rounded bg-white/[0.04]" />
      </div>
      <div className="h-7 w-16 rounded-lg bg-white/[0.06] mb-1" />
      <div className="h-2.5 w-20 rounded bg-white/[0.04]" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-3 sm:px-5 py-3 sm:py-4 animate-pulse">
      <div className="h-10 w-10 rounded-xl bg-white/[0.06] flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-3/4 rounded bg-white/[0.06]" />
        <div className="h-2.5 w-1/2 rounded bg-white/[0.04]" />
      </div>
      <div className="h-8 w-8 rounded-full bg-white/[0.06] flex-shrink-0" />
    </div>
  );
}

export function SkeletonToolCard() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 animate-pulse">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="h-8 w-8 rounded-lg bg-white/[0.06]" />
        <div className="h-3 w-24 rounded bg-white/[0.06]" />
      </div>
      <div className="h-2.5 w-full rounded bg-white/[0.04]" />
    </div>
  );
}

export function SkeletonPage({ rows = 4 }: { rows?: number }) {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      {/* Rows */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    </div>
  );
}
