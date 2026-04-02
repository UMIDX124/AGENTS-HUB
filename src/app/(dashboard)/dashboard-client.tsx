"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { AgentCard } from "@/components/agent-card";
import { AuditHistoryChart } from "@/components/audit-history-chart";
import { AutoScheduler } from "@/components/auto-scheduler";
import { ScoreRing } from "@/components/score-ring";
import { getGrade, formatDate } from "@/lib/utils";
import { AGENTS } from "@/lib/agents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { RoleName, AgentTypeName } from "@/types";
import {
  BarChart3,
  FolderOpen,
  ListTodo,
  Zap,
  TrendingUp,
  ArrowUpRight,
  GripVertical,
  RotateCcw,
} from "lucide-react";

interface DashboardClientProps {
  user: { name: string; role: RoleName };
  stats: {
    totalAudits: number;
    avgScore: number;
    projects: number;
    pendingTasks: number;
  };
  recentAudits: {
    id: string;
    url: string;
    agent: string;
    score: number;
    grade: string;
    createdAt: string;
    userName: string;
    projectName: string | null;
  }[];
  chartData: { date: string; score: number; agent?: string }[];
}

function getStatConfig(stats: DashboardClientProps["stats"]) {
  return [
    {
      key: "totalAudits",
      label: "Total Audits",
      icon: BarChart3,
      color: "#14b8a6",
      trend: stats.totalAudits > 0 ? `${stats.totalAudits} total` : "Run first audit",
      href: "/reports",
    },
    {
      key: "avgScore",
      label: "Avg SEO Score",
      icon: TrendingUp,
      color: "#06b6d4",
      trend: stats.avgScore > 0 ? `${stats.avgScore}/100` : "No data yet",
      href: "/audit",
    },
    {
      key: "projects",
      label: "Active Projects",
      icon: FolderOpen,
      color: "#a78bfa",
      trend: stats.projects > 0 ? "Active" : "Add one",
      href: "/projects",
    },
    {
      key: "pendingTasks",
      label: "Pending Tasks",
      icon: ListTodo,
      color: "#fbbf24",
      trend: stats.pendingTasks > 0 ? `${stats.pendingTasks} due` : "All clear",
      href: "/tasks",
    },
  ];
}

const agentAccentColors: Record<string, string> = {
  ONPAGE: "#14b8a6",
  TECHNICAL: "#22d3ee",
  OFFSITE: "#a78bfa",
  CONTENT: "#34d399",
  COMPETITOR: "#fbbf24",
};

const DEFAULT_WIDGET_ORDER = ["totalAudits", "avgScore", "projects", "pendingTasks"];
const WIDGET_STORAGE_KEY = "seo-hub-widget-order";

function useWidgetOrder() {
  const [order, setOrder] = useState<string[]>(DEFAULT_WIDGET_ORDER);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WIDGET_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_WIDGET_ORDER.length) {
          setOrder(parsed);
        }
      }
    } catch {}
  }, []);

  const saveOrder = useCallback((newOrder: string[]) => {
    setOrder(newOrder);
    localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(newOrder));
  }, []);

  const resetOrder = useCallback(() => {
    setOrder(DEFAULT_WIDGET_ORDER);
    localStorage.removeItem(WIDGET_STORAGE_KEY);
  }, []);

  return { order, saveOrder, resetOrder };
}

export function DashboardClient({
  user,
  stats,
  recentAudits,
  chartData,
}: DashboardClientProps) {
  const showFullDashboard = user.role === "OWNER" || user.role === "MANAGER";
  const { order, saveOrder, resetOrder } = useWidgetOrder();
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newOrder = [...order];
    const [moved] = newOrder.splice(dragIdx, 1);
    newOrder.splice(idx, 0, moved);
    saveOrder(newOrder);
    setDragIdx(idx);
  }

  const statConfigMap = Object.fromEntries(getStatConfig(stats).map((s) => [s.key, s]));
  const orderedStats = order.map((key) => statConfigMap[key]).filter(Boolean);
  const isCustomOrder = JSON.stringify(order) !== JSON.stringify(DEFAULT_WIDGET_ORDER);

  return (
    <div className="min-h-screen">
      <Topbar user={user} title="Dashboard" />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Stats grid */}
        {showFullDashboard && (
          <div>
            {isCustomOrder && (
              <div className="mb-2 flex justify-end">
                <button
                  onClick={resetOrder}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="size-3" /> Reset layout
                </button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {orderedStats.map(
                ({ key, label, icon: Icon, color, trend, href }, idx) => (
                  <div
                    key={key}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={() => setDragIdx(null)}
                    className={`cursor-grab active:cursor-grabbing ${dragIdx === idx ? "opacity-50" : ""}`}
                  >
                    <Link href={href}>
                      <Card className="card-hover relative overflow-hidden transition-colors hover:bg-accent/30">
                        <div
                          className="absolute -right-6 -top-6 size-24 rounded-full blur-2xl opacity-20"
                          style={{ backgroundColor: color }}
                        />
                        <CardContent className="relative p-4 sm:p-5">
                          <div className="mb-3 flex items-center justify-between">
                            <div
                              className="rounded-lg p-2"
                              style={{ backgroundColor: `${color}15` }}
                            >
                              <Icon className="size-4" style={{ color }} />
                            </div>
                            <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                              <ArrowUpRight className="size-3" />
                              {trend}
                            </span>
                          </div>
                          <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                            {stats[key as keyof typeof stats]}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {label}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Chart + Quick Launch */}
        <div
          className={
            showFullDashboard && chartData.length > 0
              ? "grid gap-4 lg:grid-cols-3"
              : ""
          }
        >
          {/* Chart */}
          {showFullDashboard && chartData.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm">Score Trends</CardTitle>
                  <CardDescription>
                    Audit performance over time
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  Last {chartData.length} audits
                </Badge>
              </CardHeader>
              <CardContent>
                <AuditHistoryChart data={chartData} />
              </CardContent>
            </Card>
          )}

          {/* Quick launch agents */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Launch</CardTitle>
              <CardDescription>Run an AI agent instantly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {(Object.keys(AGENTS) as AgentTypeName[]).map((key) => {
                const agent = AGENTS[key];
                const color = agentAccentColors[key];
                return (
                  <Link
                    key={key}
                    href={`/audit?agent=${key}`}
                    className="flex items-center gap-3 rounded-md border border-border/50 bg-muted/20 px-3 py-2.5 transition-all hover:border-border hover:bg-accent/50 group"
                  >
                    <span className="text-lg">{agent.icon}</span>
                    <span className="flex-1 text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                      {agent.name}
                    </span>
                    <Zap
                      className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color }}
                    />
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* 24/7 Auto-Scheduler */}
        {showFullDashboard && <AutoScheduler />}

        {/* Agent cards (non-owner/manager) */}
        {!showFullDashboard && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                AI Agents
              </h3>
              <Button variant="link" asChild className="h-auto p-0 text-xs">
                <Link href="/audit">Run audit &rarr;</Link>
              </Button>
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

        {/* Recent audits */}
        {recentAudits.length > 0 && (
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm">Recent Audits</CardTitle>
                <CardDescription>{recentAudits.length} total</CardDescription>
              </div>
              <Button variant="link" asChild className="h-auto p-0 text-xs">
                <Link href="/reports">View all &rarr;</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentAudits.slice(0, 6).map((audit) => (
                  <Link
                    key={audit.id}
                    href={`/audit/${audit.id}`}
                    className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-accent/30 group"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                      {AGENTS[audit.agent as AgentTypeName]?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                        {audit.url}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {AGENTS[audit.agent as AgentTypeName]?.name}
                        {audit.projectName && (
                          <>
                            {" "}
                            &middot;{" "}
                            <span className="text-primary/60">
                              {audit.projectName}
                            </span>
                          </>
                        )}
                        {" "}&middot; {formatDate(audit.createdAt)}
                      </p>
                    </div>
                    <ScoreRing score={audit.score} grade={audit.grade} size={44} />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {recentAudits.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                <Zap className="size-8 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No audits yet
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Run your first AI audit to get started
              </p>
              <Button asChild className="mt-5">
                <Link href="/audit">Launch Audit</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
