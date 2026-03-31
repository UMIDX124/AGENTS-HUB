"use client";

import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/score-ring";
import { HealthGrid } from "@/components/health-grid";
import { FindingsList } from "@/components/findings-list";
import { KeywordCards } from "@/components/keyword-cards";
import { CompetitorCards } from "@/components/competitor-cards";
import { AGENTS } from "@/lib/agents";
import type { RoleName, AgentTypeName, AgentResult } from "@/types";
import { pdf } from "@react-pdf/renderer";
import { ReportPDF } from "@/components/report-pdf";
import { Download } from "lucide-react";

interface AuditDetailClientProps {
  user: { name: string; role: RoleName };
  audit: {
    id: string; url: string; agent: string; score: number; grade: string;
    summary: string; createdAt: string; data: AgentResult;
    user: { name: string }; project: { id: string; name: string } | null;
  };
}

export function AuditDetailClient({ user, audit }: AuditDetailClientProps) {
  const agentConfig = AGENTS[audit.agent as AgentTypeName];

  async function exportPDF() {
    const blob = await pdf(<ReportPDF audit={audit as any} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-report-${audit.agent.toLowerCase()}-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <Topbar user={user} title={`${agentConfig?.name || audit.agent} Audit`} />
      <div className="p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <ScoreRing score={audit.score} grade={audit.grade} size={100} />
              <div>
                <CardTitle>{audit.url}</CardTitle>
                <p className="mt-1 text-sm text-[#94a3b8]">{audit.summary}</p>
                <p className="mt-1 text-xs text-[#64748b]">
                  By {audit.user.name} &middot; {new Date(audit.createdAt).toLocaleDateString()}
                  {audit.project && ` &middot; ${audit.project.name}`}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={exportPDF}>
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="health">
              <TabsList>
                <TabsTrigger value="health">Health Check</TabsTrigger>
                <TabsTrigger value="findings">Findings</TabsTrigger>
                {audit.data.keywords && <TabsTrigger value="keywords">Keywords</TabsTrigger>}
                {audit.data.competitors && <TabsTrigger value="competitors">Competitors</TabsTrigger>}
              </TabsList>
              <TabsContent value="health">
                <HealthGrid highlights={audit.data.highlights || []} />
              </TabsContent>
              <TabsContent value="findings">
                <FindingsList findings={audit.data.findings || []} />
              </TabsContent>
              {audit.data.keywords && (
                <TabsContent value="keywords">
                  <KeywordCards keywords={audit.data.keywords} />
                </TabsContent>
              )}
              {audit.data.competitors && (
                <TabsContent value="competitors">
                  <CompetitorCards competitors={audit.data.competitors} />
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
