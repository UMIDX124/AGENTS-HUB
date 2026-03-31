"use client";

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
  pass: { icon: CheckCircle, color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  warn: { icon: AlertTriangle, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  fail: { icon: XCircle, color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

export function HealthGrid({ highlights }: HealthGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {highlights.map((h, i) => {
        const config = statusConfig[h.status];
        const Icon = config.icon;
        return (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4"
          >
            <div className="rounded-lg p-2" style={{ backgroundColor: config.bg }}>
              <Icon className="h-4 w-4" style={{ color: config.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{h.metric}</p>
              <p className="mt-0.5 truncate text-xs text-[#94a3b8]">{h.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
