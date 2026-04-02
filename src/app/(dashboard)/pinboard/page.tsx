"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { formatDate } from "@/lib/utils";
import { Trash2, Pin, AlertTriangle, CheckCircle2, AlertCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/breadcrumbs";

const SEVERITY_CONFIG: Record<string, { color: string; label: string; icon: any }> = {
  critical: { color: "#f87171", label: "Critical", icon: AlertCircle },
  warning: { color: "#fbbf24", label: "Warning", icon: AlertTriangle },
  good: { color: "#34d399", label: "Good", icon: CheckCircle2 },
};

const AGENT_COLORS: Record<string, string> = {
  ONPAGE: "#14b8a6",
  TECHNICAL: "#22d3ee",
  OFFSITE: "#a78bfa",
  CONTENT: "#34d399",
  COMPETITOR: "#fbbf24",
};

const AGENT_LABELS: Record<string, string> = {
  ONPAGE: "On-Page",
  TECHNICAL: "Technical",
  OFFSITE: "Off-Site",
  CONTENT: "Content",
  COMPETITOR: "Competitor",
};

export default function PinboardPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [pins, setPins] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/pinboard").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setPins(data);
    });
  }, []);

  async function removePin(pinId: string) {
    await fetch("/api/pinboard", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinId }),
    });
    setPins((prev) => prev.filter((p) => p.id !== pinId));
  }

  const filtered = pins.filter((p) => {
    if (filter && p.severity !== filter) return false;
    if (search && !p.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const criticalCount = pins.filter((p) => p.severity === "critical").length;
  const warningCount = pins.filter((p) => p.severity === "warning").length;
  const goodCount = pins.filter((p) => p.severity === "good").length;

  return (
    <div className="min-h-screen">
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="Pinboard" subtitle="Saved Findings" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {pins.length > 0 && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: "Critical", count: criticalCount, color: "#f87171", severity: "critical" },
                { label: "Warnings", count: warningCount, color: "#fbbf24", severity: "warning" },
                { label: "Good", count: goodCount, color: "#34d399", severity: "good" },
              ].map(({ label, count, color, severity }) => (
                <button
                  key={severity}
                  onClick={() => setFilter(filter === severity ? "" : severity)}
                  className={`rounded-2xl border p-4 text-left transition-all ${filter === severity ? "border-white/20" : "border-border hover:border-white/[0.12]"}`}
                  style={{ backgroundColor: filter === severity ? `${color}10` : "rgba(255,255,255,0.01)" }}
                >
                  <p className="text-2xl font-bold" style={{ color }}>{count}</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{label}</p>
                </button>
              ))}
            </div>

            {/* Search + filter bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                <input
                  placeholder="Search pins..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/50 pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50"
                />
              </div>
              <p className="text-xs text-muted-foreground/70 flex-shrink-0">{filtered.length} of {pins.length} pins</p>
            </div>
          </>
        )}

        {/* Pins masonry grid */}
        {filtered.length > 0 ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {filtered.map((pin) => {
              const sevConfig = SEVERITY_CONFIG[pin.severity] || SEVERITY_CONFIG.good;
              const SevIcon = sevConfig.icon;
              const agentColor = AGENT_COLORS[pin.agent] || "#94a3b8";
              return (
                <div
                  key={pin.id}
                  className="mb-4 break-inside-avoid rounded-2xl border border-border bg-muted/40 p-4 transition-all hover:border-white/[0.12] hover:bg-muted/50 group"
                >
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-lg px-2 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: `${agentColor}18`, color: agentColor }}>
                        {AGENT_LABELS[pin.agent] || pin.agent}
                      </span>
                    </div>
                    <button
                      onClick={() => removePin(pin.id)}
                      className="rounded-lg p-1 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Content */}
                  <h3 className="text-sm font-semibold text-foreground/90 leading-snug">{pin.title}</h3>
                  {pin.detail && pin.detail !== pin.title && (
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{pin.detail}</p>
                  )}

                  {/* Footer */}
                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-border/60">
                    <div className="flex items-center gap-1.5">
                      <SevIcon className="h-3 w-3 flex-shrink-0" style={{ color: sevConfig.color }} />
                      <span className="text-[10px] font-semibold capitalize" style={{ color: sevConfig.color }}>
                        {sevConfig.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/50">{formatDate(pin.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : pins.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10">
              <Pin className="h-8 w-8 text-teal-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No pinned findings</h3>
            <p className="mt-1 text-sm text-muted-foreground/70">Pin important findings from audit results to review here</p>
            <a href="/audit"
              className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20">
              Run an Audit
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground/70">No pins match your filters</p>
            <button onClick={() => { setFilter(""); setSearch(""); }} className="mt-2 text-xs text-teal-400 hover:text-teal-300">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
