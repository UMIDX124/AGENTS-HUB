"use client";

import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuditHistoryChart } from "@/components/audit-history-chart";
import { ScoreRing } from "@/components/score-ring";
import { AGENTS } from "@/lib/agents";
import { formatDate, getGrade } from "@/lib/utils";
import type { RoleName, AgentTypeName } from "@/types";

interface ProjectDetailClientProps {
  user: { name: string; role: RoleName };
  project: any;
  chartData: { date: string; score: number; agent?: string }[];
}

export function ProjectDetailClient({ user, project, chartData }: ProjectDetailClientProps) {
  return (
    <div>
      <Topbar user={user} title={project.name} />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <p className="text-sm text-[#818cf8]">{project.url}</p>
            {project.description && <p className="mt-1 text-sm text-[#94a3b8]">{project.description}</p>}
          </div>
          <Link href={`/audit?project=${project.id}`}>
            <Button size="sm">Run New Audit</Button>
          </Link>
        </div>

        {/* Score trend */}
        {chartData.length > 0 && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-base">Score History</CardTitle></CardHeader>
            <CardContent><AuditHistoryChart data={chartData} /></CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Audits */}
          <Card>
            <CardHeader><CardTitle className="text-base">Audit History ({project.audits.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {project.audits.slice(0, 10).map((a: any) => (
                  <Link key={a.id} href={`/audit/${a.id}`} className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.04)] p-3 hover:border-[rgba(255,255,255,0.1)]">
                    <div className="flex items-center gap-2">
                      <span>{AGENTS[a.agent as AgentTypeName]?.icon}</span>
                      <div>
                        <p className="text-sm">{AGENTS[a.agent as AgentTypeName]?.name}</p>
                        <p className="text-xs text-[#64748b]">{formatDate(a.createdAt)}</p>
                      </div>
                    </div>
                    <ScoreRing score={a.score} grade={a.grade} size={40} />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team members */}
          <Card>
            <CardHeader><CardTitle className="text-base">Team Members ({project.members.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {project.members.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.04)] p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(129,140,248,0.2)] text-sm font-bold text-[#818cf8]">
                        {m.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{m.user.name}</p>
                        <p className="text-xs text-[#64748b]">{m.user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#94a3b8]">{m.role}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
