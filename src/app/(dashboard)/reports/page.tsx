"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { ScoreRing } from "@/components/score-ring";
import { AGENTS } from "@/lib/agents";
import { formatDate } from "@/lib/utils";
import type { AgentTypeName } from "@/types";
import { Download, FileText, Filter, Search, TrendingUp, Calendar, Globe, Trash2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { ReportPDF } from "@/components/report-pdf";

const AGENT_COLORS: Record<string, string> = {
  ONPAGE: "#818cf8",
  TECHNICAL: "#22d3ee",
  OFFSITE: "#a78bfa",
  CONTENT: "#34d399",
  COMPETITOR: "#fbbf24",
};

export default function ReportsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [audits, setAudits] = useState<any[]>([]);
  const [filterAgent, setFilterAgent] = useState("");
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterAgent) params.set("agent", filterAgent);
    fetch(`/api/reports?${params}`).then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setAudits(data);
    });
  }, [filterAgent]);

  const filtered = audits.filter((a) =>
    !search || a.url?.toLowerCase().includes(search.toLowerCase())
  );

  async function deleteAudit(auditId: string) {
    if (!confirm("Delete this report? This cannot be undone.")) return;
    await fetch("/api/reports", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auditId }),
    });
    setAudits((prev) => prev.filter((a) => a.id !== auditId));
  }

  async function exportPDF(audit: any) {
    setExporting(audit.id);
    try {
      const res = await fetch("/api/reports/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId: audit.id }),
      });
      const { audit: fullAudit } = await res.json();
      const blob = await pdf(<ReportPDF audit={fullAudit} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `seo-report-${audit.agent.toLowerCase()}-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  }

  const avgScore = audits.length ? Math.round(audits.reduce((s, a) => s + (a.score || 0), 0) / audits.length) : 0;

  return (
    <div className="min-h-screen">
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="Reports" subtitle="Audit History" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Stats row */}
        {audits.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: "Total Reports", value: audits.length, icon: FileText, color: "#818cf8" },
              { label: "Avg. SEO Score", value: `${avgScore}/100`, icon: TrendingUp, color: "#34d399" },
              { label: "Agents Used", value: new Set(audits.map((a) => a.agent)).size, icon: Filter, color: "#fbbf24" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3 sm:p-4 flex items-center gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl flex-shrink-0"
                  style={{ backgroundColor: `${color}18`, color }}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-base sm:text-lg font-bold text-white">{value}</p>
                  <p className="text-xs text-white/30">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
            <input
              placeholder="Search by URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50"
            />
          </div>
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#08090f] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
          >
            <option value="">All Agents</option>
            {(Object.keys(AGENTS) as AgentTypeName[]).map((key) => (
              <option key={key} value={key}>{AGENTS[key].name}</option>
            ))}
          </select>
        </div>

        {/* Report list */}
        {filtered.length > 0 ? (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((audit) => {
                const agentConfig = AGENTS[audit.agent as AgentTypeName];
                const color = AGENT_COLORS[audit.agent] || "#94a3b8";
                return (
                  <div key={audit.id} className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 transition-all hover:bg-white/[0.02] group">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <ScoreRing score={audit.score} grade={audit.grade} size={52} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Globe className="h-3.5 w-3.5 text-white/30 flex-shrink-0" />
                          <p className="text-sm font-semibold text-white/90 truncate">{audit.url}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
                            style={{ backgroundColor: `${color}18`, color }}>
                            {agentConfig?.icon} {agentConfig?.name}
                          </span>
                          {audit.project && (
                            <span className="text-xs text-white/30">• {audit.project.name}</span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-white/20">
                            <Calendar className="h-3 w-3" />
                            {formatDate(audit.createdAt)}
                          </span>
                          {audit.user?.name && (
                            <span className="text-xs text-white/20">by {audit.user.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => exportPDF(audit)}
                        disabled={exporting === audit.id}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs font-medium text-white/40 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-400 disabled:opacity-40"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{exporting === audit.id ? "Exporting..." : "PDF"}</span>
                      </button>
                      <button
                        onClick={() => deleteAudit(audit.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs font-medium text-white/40 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
              <FileText className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-white">No reports yet</h3>
            <p className="mt-1 text-sm text-white/30">Run an audit to generate your first SEO report</p>
            <a href="/audit"
              className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20">
              Run Your First Audit
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
