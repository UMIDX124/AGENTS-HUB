"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { ScoreRing } from "@/components/score-ring";
import { AGENTS } from "@/lib/agents";
import { formatDate } from "@/lib/utils";
import type { AgentTypeName } from "@/types";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  GitCompareArrows,
  Globe,
  Calendar,
} from "lucide-react";

const AGENT_COLORS: Record<string, string> = {
  ONPAGE: "#14b8a6",
  TECHNICAL: "#22d3ee",
  OFFSITE: "#a78bfa",
  CONTENT: "#34d399",
  COMPETITOR: "#fbbf24",
};

interface AuditOption {
  id: string;
  url: string;
  agent: string;
  score: number;
  grade: string;
  summary: string;
  createdAt: string;
  user?: { name: string };
  data: string;
}

function parseFindingsFromData(dataStr: string) {
  try {
    const data = JSON.parse(dataStr);
    return data.findings || [];
  } catch {
    return [];
  }
}

export default function ComparePage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [audits, setAudits] = useState<AuditOption[]>([]);
  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");
  const [comparison, setComparison] = useState<{ a: AuditOption; b: AuditOption } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAudits(data);
      });
  }, []);

  async function compare() {
    if (!idA || !idB) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/compare?a=${idA}&b=${idB}`);
      const data = await res.json();
      if (data.a && data.b) setComparison(data);
    } finally {
      setLoading(false);
    }
  }

  const scoreDiff = comparison ? comparison.b.score - comparison.a.score : 0;

  return (
    <div className="min-h-screen">
      <Topbar
        user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }}
        title="Compare"
        subtitle="Audit History Compare"
      />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Selection */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <GitCompareArrows className="h-4 w-4 text-teal-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Select Two Audits to Compare
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Audit A (Baseline)</label>
              <select
                value={idA}
                onChange={(e) => setIdA(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-teal-500/50"
              >
                <option value="">Select audit...</option>
                {audits.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.url} — {a.agent} ({a.score}/100) — {formatDate(a.createdAt)}
                  </option>
                ))}
              </select>
            </div>
            <ArrowRight className="hidden sm:block h-5 w-5 text-muted-foreground self-center" />
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Audit B (Latest)</label>
              <select
                value={idB}
                onChange={(e) => setIdB(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-teal-500/50"
              >
                <option value="">Select audit...</option>
                {audits.filter((a) => a.id !== idA).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.url} — {a.agent} ({a.score}/100) — {formatDate(a.createdAt)}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={compare}
              disabled={!idA || !idB || loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:brightness-110 disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? "Comparing..." : "Compare"}
            </button>
          </div>
        </div>

        {/* Comparison Results */}
        {comparison && (
          <div className="space-y-4">
            {/* Score comparison header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Audit A */}
              <div className="rounded-2xl border border-border bg-muted/40 p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">
                  Baseline
                </p>
                <ScoreRing score={comparison.a.score} grade={comparison.a.grade} size={80} />
                <p className="mt-2 text-sm font-semibold text-foreground truncate">{comparison.a.url}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span
                    className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: `${AGENT_COLORS[comparison.a.agent] || "#94a3b8"}18`,
                      color: AGENT_COLORS[comparison.a.agent] || "#94a3b8",
                    }}
                  >
                    {AGENTS[comparison.a.agent as AgentTypeName]?.name || comparison.a.agent}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(comparison.a.createdAt)}
                  </span>
                </div>
              </div>

              {/* Score diff */}
              <div className="rounded-2xl border border-border bg-muted/40 p-4 flex flex-col items-center justify-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
                  Score Change
                </p>
                <div className="flex items-center gap-2">
                  {scoreDiff > 0 ? (
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                  ) : scoreDiff < 0 ? (
                    <TrendingDown className="h-6 w-6 text-red-400" />
                  ) : (
                    <Minus className="h-6 w-6 text-muted-foreground" />
                  )}
                  <span
                    className={`text-3xl font-bold ${
                      scoreDiff > 0
                        ? "text-emerald-400"
                        : scoreDiff < 0
                        ? "text-red-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {scoreDiff > 0 ? "+" : ""}
                    {scoreDiff}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {comparison.a.score} → {comparison.b.score}
                </p>
              </div>

              {/* Audit B */}
              <div className="rounded-2xl border border-border bg-muted/40 p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">
                  Latest
                </p>
                <ScoreRing score={comparison.b.score} grade={comparison.b.grade} size={80} />
                <p className="mt-2 text-sm font-semibold text-foreground truncate">{comparison.b.url}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span
                    className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: `${AGENT_COLORS[comparison.b.agent] || "#94a3b8"}18`,
                      color: AGENT_COLORS[comparison.b.agent] || "#94a3b8",
                    }}
                  >
                    {AGENTS[comparison.b.agent as AgentTypeName]?.name || comparison.b.agent}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(comparison.b.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-muted/40 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
                  Baseline Summary
                </p>
                <p className="text-sm text-foreground/80">{comparison.a.summary}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
                  Latest Summary
                </p>
                <p className="text-sm text-foreground/80">{comparison.b.summary}</p>
              </div>
            </div>

            {/* Findings comparison */}
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">
                Findings Comparison
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(() => {
                  const findingsA = parseFindingsFromData(comparison.a.data);
                  const findingsB = parseFindingsFromData(comparison.b.data);
                  const titlesA = new Set(findingsA.map((f: any) => f.title));
                  const titlesB = new Set(findingsB.map((f: any) => f.title));

                  const resolved = findingsA.filter((f: any) => !titlesB.has(f.title));
                  const newIssues = findingsB.filter((f: any) => !titlesA.has(f.title));

                  return (
                    <>
                      <div>
                        <p className="text-xs font-semibold text-emerald-400 mb-2">
                          Resolved ({resolved.length})
                        </p>
                        {resolved.length > 0 ? (
                          <div className="space-y-1.5">
                            {resolved.map((f: any, i: number) => (
                              <div
                                key={i}
                                className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-2.5 text-xs text-emerald-400"
                              >
                                {f.title}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No resolved findings</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-red-400 mb-2">
                          New Issues ({newIssues.length})
                        </p>
                        {newIssues.length > 0 ? (
                          <div className="space-y-1.5">
                            {newIssues.map((f: any, i: number) => (
                              <div
                                key={i}
                                className="rounded-lg border border-red-500/10 bg-red-500/5 p-2.5 text-xs text-red-400"
                              >
                                {f.title}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No new issues</p>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!comparison && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10">
              <GitCompareArrows className="h-8 w-8 text-teal-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Compare Audits</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Select two audits above to see score changes and findings diff
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
