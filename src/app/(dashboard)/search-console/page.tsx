"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import {
  Search,
  Globe,
  MousePointerClick,
  Eye,
  TrendingUp,
  Hash,
  AlertTriangle,
  FileText,
  Loader2,
} from "lucide-react";

export default function SearchConsolePage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [url, setUrl] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchGSC() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search-console?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Topbar
        user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }}
        title="Search Console"
        subtitle="Google Rankings Data"
      />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* URL Input */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Website URL
            </span>
            <span className="ml-auto text-[10px] rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 font-medium">
              Mock Data
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchGSC()}
              className="flex-1 rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-indigo-500/50"
            />
            <button
              onClick={fetchGSC}
              disabled={loading || !url.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Fetching..." : "Fetch Data"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Simulated Search Console data. Connect real OAuth for live rankings.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4" /> {error}
          </div>
        )}

        {data && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Clicks", value: data.summary.totalClicks.toLocaleString(), icon: MousePointerClick, color: "#818cf8" },
                { label: "Impressions", value: data.summary.totalImpressions.toLocaleString(), icon: Eye, color: "#22d3ee" },
                { label: "Avg CTR", value: `${data.summary.avgCTR}%`, icon: TrendingUp, color: "#34d399" },
                { label: "Avg Position", value: data.summary.avgPosition.toFixed(1), icon: Hash, color: "#fbbf24" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-2xl border border-border bg-muted/40 p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}15`, color }}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-lg font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Top Queries */}
            <div className="rounded-2xl border border-border bg-muted/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
                <Search className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-foreground">Top Search Queries</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-xs text-muted-foreground">
                      <th className="px-4 py-2.5 text-left font-medium">Query</th>
                      <th className="px-4 py-2.5 text-right font-medium">Clicks</th>
                      <th className="px-4 py-2.5 text-right font-medium">Impressions</th>
                      <th className="px-4 py-2.5 text-right font-medium">CTR</th>
                      <th className="px-4 py-2.5 text-right font-medium">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.queries.map((q: any, i: number) => (
                      <tr key={i} className="border-b border-border/30 hover:bg-muted/60 transition-colors">
                        <td className="px-4 py-2.5 text-foreground font-medium">{q.query}</td>
                        <td className="px-4 py-2.5 text-right text-foreground tabular-nums">{q.clicks}</td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{q.impressions.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{q.ctr}%</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`tabular-nums font-medium ${q.position <= 3 ? "text-emerald-400" : q.position <= 10 ? "text-amber-400" : "text-red-400"}`}>
                            {q.position}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Pages */}
            <div className="rounded-2xl border border-border bg-muted/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-foreground">Top Pages</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-xs text-muted-foreground">
                      <th className="px-4 py-2.5 text-left font-medium">Page</th>
                      <th className="px-4 py-2.5 text-right font-medium">Clicks</th>
                      <th className="px-4 py-2.5 text-right font-medium">Impressions</th>
                      <th className="px-4 py-2.5 text-right font-medium">CTR</th>
                      <th className="px-4 py-2.5 text-right font-medium">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pages.map((p: any, i: number) => (
                      <tr key={i} className="border-b border-border/30 hover:bg-muted/60 transition-colors">
                        <td className="px-4 py-2.5 text-foreground font-medium truncate max-w-[200px]">{p.page}</td>
                        <td className="px-4 py-2.5 text-right text-foreground tabular-nums">{p.clicks}</td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{p.impressions.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{p.ctr}%</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`tabular-nums font-medium ${p.position <= 3 ? "text-emerald-400" : p.position <= 10 ? "text-amber-400" : "text-red-400"}`}>
                            {p.position.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!data && !loading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
              <Search className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Search Console Data</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter a URL above to see ranking data, queries, and page performance
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
