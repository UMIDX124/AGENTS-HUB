"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentCard } from "@/components/agent-card";
import { AgentLoader } from "@/components/agent-loader";
import { ScoreRing } from "@/components/score-ring";
import { HealthGrid } from "@/components/health-grid";
import { FindingsList } from "@/components/findings-list";
import { KeywordCards } from "@/components/keyword-cards";
import { CompetitorCards } from "@/components/competitor-cards";
import { AGENTS } from "@/lib/agents";
import type { AgentTypeName, AgentResult } from "@/types";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function AuditPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const searchParams = useSearchParams();
  const initialAgent = searchParams.get("agent") as AgentTypeName | null;

  const [url, setUrl] = useState("");
  const [activeAgent, setActiveAgent] = useState<AgentTypeName | null>(initialAgent);
  const [results, setResults] = useState<Record<string, AgentResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [runningAll, setRunningAll] = useState(false);

  async function runSingleAgent(agentType: AgentTypeName) {
    if (!url) { setError("Please enter a URL"); return; }
    setError(null);
    setLoading((prev) => ({ ...prev, [agentType]: true }));
    setActiveAgent(agentType);

    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, agent: agentType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults((prev) => ({ ...prev, [agentType]: data.result }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, [agentType]: false }));
    }
  }

  async function runAllAgents() {
    if (!url) { setError("Please enter a URL"); return; }
    setError(null);
    setRunningAll(true);

    const agents: AgentTypeName[] = ["ONPAGE", "TECHNICAL", "OFFSITE", "CONTENT", "COMPETITOR"];
    for (const agent of agents) {
      setActiveAgent(agent);
      setLoading((prev) => ({ ...prev, [agent]: true }));
      try {
        const res = await fetch("/api/agents/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, agent }),
        });
        const data = await res.json();
        if (res.ok) setResults((prev) => ({ ...prev, [agent]: data.result }));
      } catch {}
      setLoading((prev) => ({ ...prev, [agent]: false }));
    }
    setRunningAll(false);
  }

  async function pinFinding(finding: any) {
    await fetch("/api/pinboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: finding.title,
        detail: finding.detail,
        agent: activeAgent,
        severity: finding.severity,
      }),
    });
  }

  async function createTasksFromFindings() {
    if (!activeAgent || !results[activeAgent]) return;
    const result = results[activeAgent];
    const criticalFindings = result.findings.filter((f) => f.severity === "critical" || f.severity === "warning");

    for (const finding of criticalFindings) {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finding.title,
          description: finding.detail,
          priority: finding.severity === "critical" ? "HIGH" : "MEDIUM",
          agentSource: activeAgent,
        }),
      });
    }
    alert(`Created ${criticalFindings.length} tasks from findings!`);
  }

  const currentResult = activeAgent ? results[activeAgent] : null;
  const isLoading = activeAgent ? loading[activeAgent] : false;

  return (
    <div>
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="New Audit" />
      <div className="p-6">
        {/* URL input */}
        <Card className="mb-6">
          <CardContent className="flex items-center gap-4 p-5">
            <Input
              placeholder="Enter website URL (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={runAllAgents} disabled={runningAll || !url}>
              {runningAll ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running...</> : "Run All Agents"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
        )}

        {/* Agent selector cards */}
        <div className="mb-6 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {(Object.keys(AGENTS) as AgentTypeName[]).map((key) => (
            <AgentCard
              key={key}
              agentType={key}
              onClick={() => runSingleAgent(key)}
              isActive={activeAgent === key}
              hasResults={!!results[key]}
            />
          ))}
        </div>

        {/* Loading state */}
        {isLoading && activeAgent && (
          <AgentLoader
            agentIcon={AGENTS[activeAgent].icon}
            agentColor={AGENTS[activeAgent].color}
            agentName={AGENTS[activeAgent].name}
          />
        )}

        {/* Results */}
        {currentResult && !isLoading && activeAgent && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <ScoreRing score={currentResult.score} grade={currentResult.grade} size={80} />
                <div>
                  <CardTitle className="text-lg">{AGENTS[activeAgent].name} Results</CardTitle>
                  <p className="mt-1 text-sm text-[#94a3b8]">{currentResult.summary}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={createTasksFromFindings}>
                  Create Tasks
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="health">
                <TabsList>
                  <TabsTrigger value="health">Health Check</TabsTrigger>
                  <TabsTrigger value="findings">Findings</TabsTrigger>
                  {currentResult.keywords && <TabsTrigger value="keywords">Keywords</TabsTrigger>}
                  {currentResult.competitors && <TabsTrigger value="competitors">Competitors</TabsTrigger>}
                  {currentResult.topics && <TabsTrigger value="topics">Topics</TabsTrigger>}
                </TabsList>
                <TabsContent value="health">
                  <HealthGrid highlights={currentResult.highlights} />
                </TabsContent>
                <TabsContent value="findings">
                  <FindingsList findings={currentResult.findings} onPin={pinFinding} />
                </TabsContent>
                {currentResult.keywords && (
                  <TabsContent value="keywords">
                    <KeywordCards keywords={currentResult.keywords} />
                  </TabsContent>
                )}
                {currentResult.competitors && (
                  <TabsContent value="competitors">
                    <CompetitorCards competitors={currentResult.competitors} />
                  </TabsContent>
                )}
                {currentResult.topics && (
                  <TabsContent value="topics">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {currentResult.topics.map((t, i) => (
                        <div key={i} className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
                          <p className="text-sm font-medium">{t.topic}</p>
                          <div className="mt-1 flex gap-3 text-xs text-[#94a3b8]">
                            <span>Relevance: <span className="text-white">{t.relevance}</span></span>
                            <span>Coverage: <span className={t.coverage === "good" ? "text-green-400" : t.coverage === "partial" ? "text-yellow-400" : "text-red-400"}>{t.coverage}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )}
              </Tabs>

              {/* Quick wins */}
              {currentResult.quickWins?.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-3 text-sm font-semibold text-[#94a3b8]">Quick Wins</h4>
                  <div className="space-y-2">
                    {currentResult.quickWins.map((w, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-green-500/5 p-3 text-sm text-green-400">
                        <span className="text-green-500">&#10003;</span> {w}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
