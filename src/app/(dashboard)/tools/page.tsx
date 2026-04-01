"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import {
  Code2, FileText, Globe, Search, Sparkles, Loader2, Copy, Check,
  Tag, Braces, PenTool, Bot, ListOrdered, MapPin
} from "lucide-react";

const TOOLS = [
  {
    id: "meta-tags",
    name: "Meta Tags Generator",
    description: "Generate perfect title, meta description & OG tags — ready to paste in your HTML",
    icon: Tag,
    color: "#818cf8",
    placeholder: "Enter your website URL...",
    needsContext: false,
  },
  {
    id: "schema-markup",
    name: "Schema Markup Generator",
    description: "Generate JSON-LD structured data — Organization, WebPage, FAQ, BreadcrumbList",
    icon: Braces,
    color: "#22d3ee",
    placeholder: "Enter your website URL...",
    needsContext: false,
  },
  {
    id: "content-writer",
    name: "SEO Content Writer",
    description: "Write SEO-optimized blog posts & page content with keyword targeting",
    icon: PenTool,
    color: "#34d399",
    placeholder: "Enter your website URL...",
    contextLabel: "What topic/keyword should the content target?",
    needsContext: true,
  },
  {
    id: "robots-txt",
    name: "Robots.txt Generator",
    description: "Generate an optimized robots.txt file for your website",
    icon: Bot,
    color: "#a78bfa",
    placeholder: "Enter your website URL...",
    needsContext: false,
  },
  {
    id: "headlines",
    name: "Keyword Headlines",
    description: "Generate 10 SEO-optimized headlines that rank — for blogs, landing pages, ads",
    icon: ListOrdered,
    color: "#fbbf24",
    placeholder: "Enter your website URL...",
    contextLabel: "Target keyword or topic (optional)",
    needsContext: true,
  },
  {
    id: "sitemap-fix",
    name: "Sitemap Analyzer",
    description: "Analyze your sitemap and generate a fixed/optimized sitemap.xml",
    icon: MapPin,
    color: "#f87171",
    placeholder: "Enter your website URL...",
    needsContext: false,
  },
];

export default function ToolsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

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
        setResult(`Error: ${data.error || "Tool failed"}`);
      }
    } catch {
      setResult("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  function copyResult() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const activeTool = TOOLS.find((t) => t.id === selectedTool);

  return (
    <div className="min-h-screen">
      <Topbar
        user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }}
        title="SEO Tools"
        subtitle="Generate Ready-to-Use Code"
      />

      <div className="p-6 space-y-6">

        {/* Tool selector grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = selectedTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => { setSelectedTool(tool.id); setResult(""); }}
                className={`text-left rounded-2xl border p-4 transition-all ${
                  isActive
                    ? "border-white/20 bg-white/[0.05] shadow-lg"
                    : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
                    style={{ backgroundColor: `${tool.color}18`, color: tool.color }}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
                </div>
                <p className="text-xs text-white/30 leading-relaxed">{tool.description}</p>
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
            </div>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input
                  placeholder={activeTool.placeholder}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50"
                />
              </div>
              <button
                onClick={runTool}
                disabled={loading || !url}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110 disabled:opacity-40 flex-shrink-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Generating..." : "Generate"}
              </button>
            </div>

            {activeTool.needsContext && (
              <input
                placeholder={activeTool.contextLabel}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50"
              />
            )}
          </div>
        )}

        {/* Result area */}
        {result && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Generated Code — Copy & Paste</h3>
              </div>
              <button
                onClick={copyResult}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/60 transition-all hover:bg-white/[0.06] hover:text-white"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy All"}
              </button>
            </div>
            <pre className="p-5 text-xs text-white/70 font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-[500px] overflow-y-auto">
              {result}
            </pre>
          </div>
        )}

        {/* Empty state */}
        {!selectedTool && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
              <Code2 className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Select a Tool Above</h3>
            <p className="mt-1 text-sm text-white/30">Generate ready-to-use SEO code for your website</p>
          </div>
        )}
      </div>
    </div>
  );
}
