"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SkeletonLine({
  width = "100%",
  height = "12px",
}: {
  width?: string;
  height?: string;
}) {
  return <Skeleton className="rounded" style={{ width, height }} />;
}

export function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-2.5 w-full" />
      </CardContent>
    </Card>
  );
}

export function SkeletonStatCard() {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="size-10 rounded-lg" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-7 w-16 rounded-md mb-1" />
        <Skeleton className="h-2.5 w-20" />
      </CardContent>
    </Card>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <Skeleton className="size-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>
      <Skeleton className="size-8 rounded-full shrink-0" />
    </div>
  );
}

export function SkeletonToolCard() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2.5 mb-2">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-2.5 w-full" />
      </CardContent>
    </Card>
  );
}

export function SkeletonPage({ rows = 4 }: { rows?: number }) {
  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
      {/* Rows */}
      <Card>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </Card>
    </div>
  );
}
