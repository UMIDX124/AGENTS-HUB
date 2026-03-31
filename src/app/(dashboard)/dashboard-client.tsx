"use client";

import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { AgentCard } from "@/components/agent-card";
import { AuditHistoryChart } from "@/components/audit-history-chart";
import { ScoreRing } from "@/components/score-ring";
import { getGrade, formatDate } from "@/lib/utils";
import { AGENTS } from "@/lib/agents";
import type { RoleName, AgentTypeName } from "@/types";
import { BarChart3, FolderOpen, ListTodo, Zap, TrendingUp, ArrowUpRight } from "lucide-react";

interface DashboardClientProps {
  user: { name: string; role: RoleName };
  stats: { totalAudits: number; avgScore: number; projects: number; pendingTasks: number };
  recentAudits: {
    id: string; url: string; agent: string; score: number; grade: string;
    createdAt: string; userName: string; projectName: string | null;
  }[];
  chartData: { date: string; score: number; agent?: string }[];
}

const statConfig = [
  { key: "totalAudits",  label: "Total Audits",     icon: BarChart3,   color: "#818cf8", grad: "from-indigo-500/20 to-indigo-500/0",  trend: "+12%" },
  { key: "avgScore",     label: "Avg SEO Score",     icon: TrendingUp,  color: "#34d399", grad: "from-emerald-500/20 to-emerald-500/0", trend: "+5 pts" },
  { key: "projects",     label: "Active Projects",   icon: FolderOpen,  color: "#a78bfa", grad: "from-purple-500/20 to-purple-500/0",  trend: "Stable" },
  { key: "pendingTasks", label: "Pending Tasks",     icon: ListTodo,    color: "#fbbf24", grad: "from-amber-500/20 to-amber-500/0",   trend: "4 due" },
];

export function DashboardClient({ user, stats, recentAudits, chartData }: DashboardClientProps) {
  const showFullDashboard = user.role === "OWNER" || user.role === "MANAGER";

  return (
    <div className="min-h-screen">
      <Topbar user={user} title="Dashboard" />

      <div className="p-6 space-y-8">

        {/* ── Stats grid ── */}
        {showFullDashboard && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statConfig.map(({ key, label, icon: Icon, color, grad, trend }) => (
              <div
                key={key}
                className="card-hover relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
              >
                {/* Gradient blob */}
                <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${grad} blur-2xl`} />

                <div className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-xl p-2.5" style={{ backgroundColor: `${color}18` }}>
                      <Icon className="h-5 w-5" style={{ color }} />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-white/30">
                      <ArrowUpRight className="h-3 w-3" />
                      {trend}
                    </span>
                  </div>
                  <p className="text-3xl font-bold tracking-tight text-white">
                    {stats[key as keyof typeof stats]}
                  </p>
                  <p className="mt-1 text-xs font-medium text-white/40">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Chart + Quick Launch ── */}
        <div className={showFullDashboard && chartData.length > 0 ? "grid gap-6 lg:grid-cols-3" : ""}>

          {/* Chart */}
          {showFullDashboard && chartData.length > 0 && (
            <div className="lg:col-span-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Score Trends</h3>
                  <p className="text-xs text-white/30 mt-0.5">Audit performance over time</p>
                </div>
                <span className="rounded-lg border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">
                  Last {chartData.length} audits
                </span>
              </div>
              <AuditHistoryChart data={chartData} />
            </div>
          )}

          {/* Quick launch agents */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white">Quick Launch</h3>
              <p className="text-xs text-white/30 mt-0.5">Run an AI agent instantly</p>
            </div>
            <div className="space-y-2">
              {(Object.keys(AGENTS) as AgentTypeName[]).map((key) => {
                const agent = AGENTS[key];
                const colors: Record<string, string> = {
                  ONPAGE: "#818cf8", TECHNICAL: "#22d3ee", OFFSITE: "#a78bfa",
                  CONTENT: "#34d399", COMPETITOR: "#fbbf24",
                };
                const color = colors[key];
                return (
                  <Link
                    key={key}
                    href={`/audit?agent=${key}`}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 transition-all hover:border-white/[0.1] hover:bg-white/[0.04] group"
                  >
                    <span className="text-xl">{agent.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
                        {agent.name}
                      </p>
                    </div>
                    <Zap className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Agent cards ── */}
        {!showFullDashboard && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">AI Agents</h3>
              <Link href="/audit" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Run audit →
              </Link>
            </div>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {(Object.keys(AGENTS) as AgentTypeName[]).map((key) => (
                <Link key={key} href={`/audit?agent=${key}`}>
                  <AgentCard agentType={key} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent audits ── */}
        {recentAudits.length > 0 && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Audits</h3>
                <p className="text-xs text-white/30 mt-0.5">{recentAudits.length} total</p>
              </div>
              <Link href="/reports" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                View all →
              </Link>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {recentAudits.slice(0, 6).map((audit) => (
                <Link
                  key={audit.id}
                  href={`/audit/${audit.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-all hover:bg-white/[0.02] group"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-xl">
                    {AGENTS[audit.agent as AgentTypeName]?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                      {audit.url}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {AGENTS[audit.agent as AgentTypeName]?.name}
                      {audit.projectName && <> · <span className="text-indigo-400/60">{audit.projectName}</span></>}
                      <> · {formatDate(audit.createdAt)}</>
                    </p>
                  </div>
                  <ScoreRing score={audit.score} grade={audit.grade} size={44} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {recentAudits.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
              <Zap className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-white">No audits yet</h3>
            <p className="mt-1 text-sm text-white/30">Run your first AI audit to get started</p>
            <Link
              href="/audit"
              className="mt-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110"
            >
              Launch Audit
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
