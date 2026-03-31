"use client";

import { Pin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Finding {
  title: string;
  severity: "critical" | "warning" | "good";
  detail: string;
}

interface FindingsListProps {
  findings: Finding[];
  onPin?: (finding: Finding) => void;
}

const severityConfig = {
  critical: { color: "#f87171", bg: "rgba(248,113,113,0.1)", label: "Critical" },
  warning: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", label: "Warning" },
  good: { color: "#34d399", bg: "rgba(52,211,153,0.1)", label: "Good" },
};

export function FindingsList({ findings, onPin }: FindingsListProps) {
  return (
    <div className="space-y-3">
      {findings.map((finding, i) => {
        const config = severityConfig[finding.severity];
        return (
          <div
            key={i}
            className="flex items-start justify-between gap-4 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="rounded px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: config.bg, color: config.color }}
                >
                  {config.label}
                </span>
                <span className="text-sm font-medium">{finding.title}</span>
              </div>
              <p className="mt-1 text-sm text-[#94a3b8]">{finding.detail}</p>
            </div>
            {onPin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onPin(finding)}
                className="h-8 w-8 shrink-0 text-[#64748b] hover:text-[#818cf8]"
              >
                <Pin className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
