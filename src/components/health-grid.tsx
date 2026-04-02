"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface Highlight {
  metric: string;
  value: string;
  status: "pass" | "warn" | "fail";
}

interface HealthGridProps {
  highlights: Highlight[];
}

const statusConfig = {
  pass: {
    icon: CheckCircle,
    color: "#34d399",
    bgClass: "bg-emerald-500/10",
  },
  warn: {
    icon: AlertTriangle,
    color: "#fbbf24",
    bgClass: "bg-amber-500/10",
  },
  fail: {
    icon: XCircle,
    color: "#f87171",
    bgClass: "bg-red-500/10",
  },
};

export function HealthGrid({ highlights }: HealthGridProps) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {highlights.map((h, i) => {
        const config = statusConfig[h.status];
        const Icon = config.icon;
        return (
          <Card key={i} className="transition-colors hover:bg-accent/20">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`shrink-0 rounded-lg p-2 ${config.bgClass}`}>
                <Icon className="size-4" style={{ color: config.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-snug">
                  {h.metric}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {h.value}
                </p>
              </div>
              <span
                className="shrink-0 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: `${config.color}18`, color: config.color }}
              >
                {h.status}
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
