"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { AGENTS } from "@/lib/agents";
import { formatDate } from "@/lib/utils";
import type { AgentTypeName } from "@/types";
import {
  Clock,
  Plus,
  Trash2,
  Globe,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/breadcrumbs";

const AGENT_COLORS: Record<string, string> = {
  ONPAGE: "#14b8a6", TECHNICAL: "#22d3ee", OFFSITE: "#a78bfa", CONTENT: "#34d399", COMPETITOR: "#fbbf24",
};

export default function ScheduledPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form
  const [url, setUrl] = useState("");
  const [agent, setAgent] = useState<AgentTypeName>("ONPAGE");
  const [frequency, setFrequency] = useState("weekly");

  useEffect(() => {
    fetch("/api/scheduled-audits").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setSchedules(data);
    }).finally(() => setLoading(false));
  }, []);

  async function createSchedule() {
    if (!url.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/scheduled-audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, agent, frequency }),
      });
      const data = await res.json();
      if (data.id) {
        setSchedules((prev) => [data, ...prev]);
        setUrl("");
      }
    } finally {
      setCreating(false);
    }
  }

  async function toggleSchedule(id: string, enabled: boolean) {
    await fetch("/api/scheduled-audits", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled: !enabled }),
    });
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !enabled } : s)));
  }

  async function deleteSchedule(id: string) {
    await fetch("/api/scheduled-audits", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="min-h-screen">
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="Scheduled" subtitle="Automated Audits" />

      <div className="p-4 sm:p-6 space-y-5 max-w-3xl">
        {/* Create new schedule */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15">
              <Clock className="h-4 w-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Schedule New Audit</h2>
              <p className="text-xs text-muted-foreground">Auto-run SEO audits on a recurring schedule</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={agent}
                onChange={(e) => setAgent(e.target.value as AgentTypeName)}
                className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-teal-500/50"
              >
                {(Object.keys(AGENTS) as AgentTypeName[]).map((key) => (
                  <option key={key} value={key}>{AGENTS[key].name}</option>
                ))}
              </select>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-teal-500/50"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <button
              onClick={createSchedule}
              disabled={creating || !url.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 hover:brightness-110 disabled:opacity-50"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {creating ? "Creating..." : "Create Schedule"}
            </button>
          </div>
        </div>

        {/* Schedule list */}
        {schedules.length > 0 ? (
          <div className="rounded-2xl border border-border bg-muted/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-400" />
              <h3 className="text-sm font-semibold text-foreground">Active Schedules ({schedules.length})</h3>
            </div>
            <div className="divide-y divide-border/50">
              {schedules.map((s) => {
                const color = AGENT_COLORS[s.agent] || "#94a3b8";
                const agentConfig = AGENTS[s.agent as AgentTypeName];
                return (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.enabled ? "" : "opacity-40"}`}
                        style={{ backgroundColor: `${color}15`, color }}>
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <p className={`text-sm text-foreground truncate ${!s.enabled ? "opacity-40" : ""}`}>{s.url}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${color}18`, color }}>
                            {agentConfig?.name || s.agent}
                          </span>
                          <span className="text-[10px] text-muted-foreground capitalize">{s.frequency}</span>
                          {s.nextRun && (
                            <span className="text-[10px] text-muted-foreground">
                              Next: {formatDate(s.nextRun)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button
                        onClick={() => toggleSchedule(s.id, s.enabled)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {s.enabled ? (
                          <ToggleRight className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteSchedule(s.id)}
                        className="text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10">
              <Clock className="h-8 w-8 text-teal-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No scheduled audits</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a schedule above to auto-run audits on a recurring basis
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
