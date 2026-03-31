"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/score-ring";
import { AGENTS } from "@/lib/agents";
import { formatDate } from "@/lib/utils";
import type { AgentTypeName } from "@/types";
import { Download, FileText } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { ReportPDF } from "@/components/report-pdf";

export default function ReportsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [audits, setAudits] = useState<any[]>([]);
  const [filterAgent, setFilterAgent] = useState("");
  const [filterProject, setFilterProject] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterAgent) params.set("agent", filterAgent);
    if (filterProject) params.set("projectId", filterProject);
    fetch(`/api/reports?${params}`).then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setAudits(data);
    });
  }, [filterAgent, filterProject]);

  async function exportPDF(audit: any) {
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
    a.download = `report-${audit.agent.toLowerCase()}-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="Reports" />
      <div className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="h-9 rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-transparent px-3 text-sm"
          >
            <option value="">All Agents</option>
            {(Object.keys(AGENTS) as AgentTypeName[]).map((key) => (
              <option key={key} value={key}>{AGENTS[key].name}</option>
            ))}
          </select>
        </div>

        {/* Audit list */}
        <div className="space-y-3">
          {audits.map((audit) => (
            <Card key={audit.id}>
              <CardContent className="flex items-center justify-between p-4">
                <Link href={`/audit/${audit.id}`} className="flex flex-1 items-center gap-4">
                  <ScoreRing score={audit.score} grade={audit.grade} size={50} />
                  <div>
                    <p className="text-sm font-medium">{audit.url}</p>
                    <p className="text-xs text-[#94a3b8]">
                      {AGENTS[audit.agent as AgentTypeName]?.icon} {AGENTS[audit.agent as AgentTypeName]?.name}
                      {audit.project && ` • ${audit.project.name}`}
                      {" • "}{formatDate(audit.createdAt)}
                      {" • by "}{audit.user?.name}
                    </p>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => exportPDF(audit)} className="shrink-0">
                  <Download className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {audits.length === 0 && (
          <div className="mt-12 flex flex-col items-center gap-3 text-[#64748b]">
            <FileText className="h-12 w-12" />
            <p className="text-sm">No reports yet. Run an audit to generate your first report.</p>
          </div>
        )}
      </div>
    </div>
  );
}
