"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { ScoreRing } from "@/components/score-ring";
import { AGENTS } from "@/lib/agents";
import { formatDate } from "@/lib/utils";
import type { AgentTypeName } from "@/types";
import {
  BarChart3,
  TrendingUp,
  FolderOpen,
  Globe,
  Calendar,
  Shield,
} from "lucide-react";

const AGENT_COLORS: Record<string, string> = {
  ONPAGE: "#818cf8",
  TECHNICAL: "#22d3ee",
  OFFSITE: "#a78bfa",
  CONTENT: "#34d399",
  COMPETITOR: "#fbbf24",
};

export default function ClientPortalPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [projects, setProjects] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/reports").then((r) => r.json()),
    ])
      .then(([projData, auditData]) => {
        setProjects(Array.isArray(projData) ? projData : projData.projects || []);
        setAudits(Array.isArray(auditData) ? auditData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const avgScore = audits.length
    ? Math.round(audits.reduce((s, a) => s + (a.score || 0), 0) / audits.length)
    : 0;

  return (
    <div className="min-h-screen">
      <Topbar
        user={{ name: user?.name || "Client", role: user?.role || "CLIENT" }}
        title="Client Portal"
        subtitle="Your SEO Overview"
      />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Welcome */}
        <div className="rounded-2xl border border-border bg-muted/40 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15">
              <Shield className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Welcome, {user?.name?.split(" ")[0] || "Client"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Read-only view of your SEO project performance
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Total Audits", value: audits.length, icon: BarChart3, color: "#818cf8" },
            { label: "Avg. Score", value: `${avgScore}/100`, icon: TrendingUp, color: "#34d399" },
            { label: "Projects", value: projects.length, icon: FolderOpen, color: "#a78bfa" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl border border-border bg-muted/40 p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15`, color }}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Projects */}
        {projects.length > 0 && (
          <div className="rounded-2xl border border-border bg-muted/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-foreground">Your Projects</h3>
            </div>
            <div className="divide-y divide-border/50">
              {projects.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.url}</p>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${p.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Audits */}
        {audits.length > 0 ? (
          <div className="rounded-2xl border border-border bg-muted/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-foreground">Audit History</h3>
            </div>
            <div className="divide-y divide-border/50">
              {audits.slice(0, 15).map((audit: any) => {
                const agentConfig = AGENTS[audit.agent as AgentTypeName];
                const color = AGENT_COLORS[audit.agent] || "#94a3b8";
                return (
                  <div key={audit.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <ScoreRing score={audit.score} grade={audit.grade} size={44} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <p className="text-sm text-foreground truncate">{audit.url}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${color}18`, color }}>
                            {agentConfig?.name || audit.agent}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(audit.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
              <BarChart3 className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No audits yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your team will run SEO audits and results will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
