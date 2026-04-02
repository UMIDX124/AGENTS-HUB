"use client";

interface ScoreBreakdownProps {
  findings: Array<{ severity: string; title: string }>;
  score: number;
}

const SEVERITY_CONFIG: Record<string, { label: string; color: string; impact: string }> = {
  critical: { label: "Critical", color: "#ef4444", impact: "-15 pts each" },
  warning: { label: "Warning", color: "#f59e0b", impact: "-5 pts each" },
  info: { label: "Info", color: "#06b6d4", impact: "-1 pt each" },
  good: { label: "Good", color: "#34d399", impact: "+0 (passed)" },
};

export function ScoreBreakdown({ findings, score }: ScoreBreakdownProps) {
  const counts = findings.reduce((acc, f) => {
    const sev = f.severity || "info";
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const criticalPenalty = (counts.critical || 0) * 15;
  const warningPenalty = (counts.warning || 0) * 5;
  const infoPenalty = (counts.info || 0) * 1;
  const totalPenalty = criticalPenalty + warningPenalty + infoPenalty;

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">
        Score Breakdown
      </h4>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Base Score</span>
          <span className="font-mono font-bold text-foreground">100</span>
        </div>

        {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => {
          const count = counts[key] || 0;
          if (count === 0 && key !== "good") return null;
          return (
            <div key={key} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span className="text-muted-foreground">
                  {count} {cfg.label} {count !== 1 ? "issues" : "issue"}
                </span>
                <span className="text-[10px] text-muted-foreground/50">({cfg.impact})</span>
              </div>
              <span className="font-mono font-medium" style={{ color: key === "good" ? cfg.color : "#ef4444" }}>
                {key === "good" ? "+0" : key === "critical" ? `-${count * 15}` : key === "warning" ? `-${count * 5}` : `-${count}`}
              </span>
            </div>
          );
        })}

        <div className="border-t border-border/50 pt-2 mt-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">Final Score</span>
          <span className="font-mono font-bold text-lg" style={{ color: score >= 70 ? "#34d399" : score >= 50 ? "#f59e0b" : "#ef4444" }}>
            {score}/100
          </span>
        </div>
      </div>

      {/* Visual bar */}
      <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${score}%`,
            background: score >= 70 ? "linear-gradient(90deg, #34d399, #14b8a6)" : score >= 50 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #ef4444, #f97316)",
          }}
        />
      </div>
    </div>
  );
}
