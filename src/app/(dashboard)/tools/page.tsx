"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { MarkdownView } from "@/components/markdown-view";
import {
  Code2, Globe, Sparkles, Loader2, Copy, Check,
  Tag, Braces, PenTool, Bot, ListOrdered, MapPin,
  Search, Link2, Bug, Mail, Share2, FileEdit, BarChart3, Clock,
  TrendingUp
} from "lucide-react";

const TOOLS = [
  // === Code Generators ===
  { id: "meta-tags", name: "Meta Tags Generator", description: "Title, description & OG tags — copy paste into HTML", icon: Tag, color: "#818cf8", category: "generate", needsContext: false },
  { id: "schema-markup", name: "Schema Markup", description: "JSON-LD structured data for Google rich results", icon: Braces, color: "#22d3ee", category: "generate", needsContext: false },
  { id: "robots-txt", name: "Robots.txt Generator", description: "Optimized crawl rules for search engines", icon: Bot, color: "#a78bfa", category: "generate", needsContext: false },
  { id: "sitemap-fix", name: "Sitemap Generator", description: "Complete XML sitemap ready to upload", icon: MapPin, color: "#f87171", category: "generate", needsContext: false },

  // === Content Creation ===
  { id: "content-writer", name: "Blog Post Writer", description: "Full SEO-optimized article (800-1200 words)", icon: PenTool, color: "#34d399", category: "content", contextLabel: "Topic/keyword to target", needsContext: true },
  { id: "headlines", name: "Headline Generator", description: "10 click-worthy, keyword-rich headlines", icon: ListOrdered, color: "#fbbf24", category: "content", contextLabel: "Target keyword (optional)", needsContext: true },
  { id: "social-posts", name: "Social Media Posts", description: "SEO content → Twitter, LinkedIn, Facebook posts", icon: Share2, color: "#f472b6", category: "content", contextLabel: "Topic or page URL to promote", needsContext: true },
  { id: "outreach-email", name: "Outreach Emails", description: "Backlink request emails that actually get replies", icon: Mail, color: "#fb923c", category: "content", contextLabel: "What you want backlinks for (page/topic)", needsContext: true },

  // === Research & Analysis ===
  { id: "keyword-research", name: "Keyword Research", description: "Find high-volume, low-difficulty keywords in your niche", icon: Search, color: "#818cf8", category: "research", contextLabel: "Seed keyword or niche (optional)", needsContext: true },
  { id: "backlink-finder", name: "Backlink Opportunities", description: "Find where competitors get backlinks — target same sites", icon: Link2, color: "#a78bfa", category: "research", needsContext: false },
  { id: "internal-linking", name: "Internal Linking Plan", description: "Optimal internal link structure for your website", icon: TrendingUp, color: "#34d399", category: "research", needsContext: false },
  { id: "site-audit", name: "Technical Site Audit", description: "Find broken links, missing tags, speed issues, crawl errors", icon: Bug, color: "#f87171", category: "research", needsContext: false },

  // === Tracking ===
  { id: "rank-check", name: "Rank Checker", description: "Check where your website ranks for target keywords", icon: BarChart3, color: "#fbbf24", category: "track", contextLabel: "Keywords to check (comma separated)", needsContext: true },
  { id: "weekly-report", name: "Weekly SEO Report", description: "Comprehensive weekly performance summary", icon: Clock, color: "#22d3ee", category: "track", needsContext: false },
];

const CATEGORIES = [
  { id: "all", label: "All Tools", count: TOOLS.length },
  { id: "generate", label: "Code Generators", count: TOOLS.filter(t => t.category === "generate").length },
  { id: "content", label: "Content Creation", count: TOOLS.filter(t => t.category === "content").length },
  { id: "research", label: "Research & Analysis", count: TOOLS.filter(t => t.category === "research").length },
  { id: "track", label: "Tracking", count: TOOLS.filter(t => t.category === "track").length },
];

export default function ToolsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [url, setUrl] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const filteredTools = category === "all" ? TOOLS : TOOLS.filter(t => t.category === category);
  const activeTool = TOOLS.find((t) => t.id === selectedTool);

  // Loading timer
  useEffect(() => {
    if (loading) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading]);

  async function runTool() {
    if (!selectedTool || !url) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: selectedTool, url, context }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.result);
      } else {
        setResult(`Error: ${data.error || "Tool failed — try again"}`);
      }
    } catch {
      setResult("Network error — check your connection and try again");
    } finally {
      setLoading(false);
    }
  }

  function copyResult() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen">
      <Topbar
        user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }}
        title="SEO Tools"
        subtitle={`${TOOLS.length} Tools Available`}
      />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                category === cat.id
                  ? "bg-indigo-500/15 border border-indigo-500/30 text-indigo-400"
                  : "border border-white/[0.07] text-white/40 hover:bg-white/[0.04] hover:text-white/60"
              }`}
            >
              {cat.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                category === cat.id ? "bg-indigo-500/20" : "bg-white/[0.06]"
              }`}>{cat.count}</span>
            </button>
          ))}
        </div>

        {/* Tool selector grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = selectedTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => { setSelectedTool(tool.id); setResult(""); }}
                className={`text-left rounded-2xl border p-4 transition-all group ${
                  isActive
                    ? "border-white/20 bg-white/[0.05] shadow-lg"
                    : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${tool.color}18`, color: tool.color }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-semibold text-white leading-tight">{tool.name}</h3>
                </div>
                <p className="text-[11px] text-white/30 leading-relaxed">{tool.description}</p>
              </button>
            );
          })}
        </div>

        {/* Tool input area */}
        {selectedTool && activeTool && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">{activeTool.name}</h3>
              {loading && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-white/40">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  {elapsed}s — AI is generating...
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runTool()}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50"
                />
              </div>
              <button
                onClick={runTool}
                disabled={loading || !url}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110 disabled:opacity-40 flex-shrink-0 whitespace-nowrap"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? `${elapsed}s` : "Generate"}
              </button>
            </div>

            {activeTool.needsContext && (
              <input
                placeholder={(activeTool as any).contextLabel || "Additional context..."}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runTool()}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50"
              />
            )}

            {/* Loading progress bar */}
            {loading && (
              <div className="space-y-2">
                <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" style={{ width: `${Math.min(95, elapsed * 3)}%`, transition: "width 1s ease" }} />
                </div>
                <p className="text-[11px] text-white/25">
                  {elapsed < 5 ? "Connecting to AI model..." : elapsed < 15 ? "AI is analyzing your website..." : elapsed < 30 ? "Generating optimized code..." : "Almost done — finalizing output..."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Result area */}
        {result && !loading && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Generated Output</h3>
                <span className="text-xs text-white/20">— generated in {elapsed}s</span>
              </div>
              <button
                onClick={copyResult}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/60 transition-all hover:bg-white/[0.06] hover:text-white"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy All"}
              </button>
            </div>
            <div className="p-3 sm:p-5 max-h-[60vh] overflow-y-auto">
              <MarkdownView content={result} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!selectedTool && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-14 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10">
              <Code2 className="h-7 w-7 text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Select a Tool Above</h3>
            <p className="mt-1 text-sm text-white/30">14 powerful SEO tools — all FREE, all generate ready-to-use output</p>
          </div>
        )}
      </div>
    </div>
  );
}
