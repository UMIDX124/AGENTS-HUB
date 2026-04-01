"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/topbar";
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
import { Loader2, Zap, Globe, CheckCircle2, ListTodo, Pin } from "lucide-react";

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
  const [pinSuccess, setPinSuccess] = useState(false);
  const [taskSuccess, setTaskSuccess] = useState(false);

  function validateUrl(input: string): string | null {
    let u = input.trim();
    if (!u) return null;
    if (!u.startsWith("http")) u = "https://" + u;
    try { new URL(u); return u; } catch { return null; }
  }

  async function runSingleAgent(agentType: AgentTypeName) {
    const validUrl = validateUrl(url);
    if (!validUrl) { setError("Please enter a valid URL (e.g. example.com)"); return; }
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
    if (!url) { setError("Please enter a website URL first"); return; }
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
      body: JSON.stringify({ title: finding.title, detail: finding.detail, agent: activeAgent, severity: finding.severity }),
    });
    setPinSuccess(true);
    setTimeout(() => setPinSuccess(false), 2000);
  }

  async function createTasksFromFindings() {
    if (!activeAgent || !results[activeAgent]) return;
    const result = results[activeAgent];
    const criticalFindings = result.findings.filter((f) => f.severity === "critical" || f.severity === "warning");
    for (const finding of criticalFindings) {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: finding.title, description: finding.detail, priority: finding.severity === "critical" ? "HIGH" : "MEDIUM", agentSource: activeAgent }),
      });
    }
    setTaskSuccess(true);
    setTimeout(() => setTaskSuccess(false), 2000);
  }

  const currentResult = activeAgent ? results[activeAgent] : null;
  const isLoading = activeAgent ? loading[activeAgent] : false;
  const completedCount = Object.keys(results).length;

  return (
    <div className="min-h-screen">
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="AI Audit" subtitle="SEO Intelligence" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* URL Input Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3 sm:p-5">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative">
            <div className="mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/30">Target Website</span>
            </div>
            <div className="flex gap-3">
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runAllAgents()}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.06]"
              />
              <button
                onClick={runAllAgents}
                disabled={runningAll || !url}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {runningAll ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Running All...</>
                ) : (
                  <><Zap className="h-4 w-4" /> Run All 5 Agents</>
                )}
              </button>
            </div>
            {completedCount > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>{completedCount}/5 agents completed</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <span className="text-lg">⚠</span> {error}
          </div>
        )}

        {/* Agent Cards */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/25">Select Agent or Run All</p>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
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
        </div>

        {/* Loading */}
        {isLoading && activeAgent && (
          <AgentLoader
            agentIcon={AGENTS[activeAgent].icon}
            agentColor={AGENTS[activeAgent].color}
            agentName={AGENTS[activeAgent].name}
          />
        )}

        {/* Results */}
        {currentResult && !isLoading && activeAgent && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            {/* Result header */}
            <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
              <div className="flex items-center gap-4">
                <ScoreRing score={currentResult.score} grade={currentResult.grade} size={80} />
                <div>
                  <h2 className="text-base font-bold text-white">{AGENTS[activeAgent].name} Results</h2>
                  <p className="mt-1 text-sm text-white/40 max-w-lg">{currentResult.summary}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => pinFinding({ title: currentResult.summary, detail: currentResult.summary, severity: "good" })}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/60 transition-all hover:bg-white/[0.06] hover:text-white"
                >
                  <Pin className="h-3.5 w-3.5" />
                  {pinSuccess ? "Pinned!" : "Pin"}
                </button>
                <button
                  onClick={createTasksFromFindings}
                  className="flex items-center gap-1.5 rounded-xl border border-indigo-500/25 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-400 transition-all hover:bg-indigo-500/20"
                >
                  <ListTodo className="h-3.5 w-3.5" />
                  {taskSuccess ? "Tasks Created!" : "Create Tasks"}
                </button>
              </div>
            </div>

            <div className="p-5">
              <Tabs defaultValue="health">
                <TabsList>
                  <TabsTrigger value="health">Health Check</TabsTrigger>
                  <TabsTrigger value="findings">Findings ({currentResult.findings?.length || 0})</TabsTrigger>
                  {currentResult.keywords && <TabsTrigger value="keywords">Keywords</TabsTrigger>}
                  {currentResult.competitors && <TabsTrigger value="competitors">Competitors</TabsTrigger>}
                  {currentResult.topics && <TabsTrigger value="topics">Topics</TabsTrigger>}
                </TabsList>
                <TabsContent value="health" className="mt-4">
                  <HealthGrid highlights={currentResult.highlights} />
                </TabsContent>
                <TabsContent value="findings" className="mt-4">
                  <FindingsList findings={currentResult.findings} onPin={pinFinding} />
                </TabsContent>
                {currentResult.keywords && (
                  <TabsContent value="keywords" className="mt-4">
                    <KeywordCards keywords={currentResult.keywords} />
                  </TabsContent>
                )}
                {currentResult.competitors && (
                  <TabsContent value="competitors" className="mt-4">
                    <CompetitorCards competitors={currentResult.competitors} />
                  </TabsContent>
                )}
                {currentResult.topics && (
                  <TabsContent value="topics" className="mt-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {currentResult.topics.map((t, i) => (
                        <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                          <p className="text-sm font-semibold text-white">{t.topic}</p>
                          <div className="mt-2 flex gap-3 text-xs">
                            <span className="text-white/40">Relevance: <span className="text-white/70">{t.relevance}</span></span>
                            <span className={t.coverage === "good" ? "text-emerald-400" : t.coverage === "partial" ? "text-amber-400" : "text-red-400"}>
                              {t.coverage}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )}
              </Tabs>

              {currentResult.quickWins?.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/25">Quick Wins</p>
                  <div className="space-y-2">
                    {currentResult.quickWins.map((w, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3 text-sm text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
