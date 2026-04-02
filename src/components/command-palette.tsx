"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Search, Wrench, FileText, FolderOpen, ListTodo,
  Users, Pin, Settings, Activity, GitCompareArrows, Globe, Shield,
  Code, CreditCard, Clock, MessageSquare, Zap, Cog, Link2, FileEdit, Target,
} from "lucide-react";

const COMMANDS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, section: "Navigation" },
  { label: "Run Audit", href: "/audit", icon: Zap, section: "Navigation" },
  { label: "SEO Tools", href: "/tools", icon: Wrench, section: "Navigation" },
  { label: "Reports", href: "/reports", icon: FileText, section: "Navigation" },
  { label: "Projects", href: "/projects", icon: FolderOpen, section: "Navigation" },
  { label: "Tasks", href: "/tasks", icon: ListTodo, section: "Navigation" },
  { label: "Team", href: "/team", icon: Users, section: "Navigation" },
  { label: "Pinboard", href: "/pinboard", icon: Pin, section: "Navigation" },
  { label: "Settings", href: "/settings", icon: Settings, section: "Navigation" },
  { label: "Activity Log", href: "/activity", icon: Activity, section: "Navigation" },
  { label: "Compare Audits", href: "/compare", icon: GitCompareArrows, section: "Navigation" },
  { label: "Search Console", href: "/search-console", icon: Globe, section: "Navigation" },
  { label: "API Docs", href: "/docs", icon: Code, section: "Navigation" },
  { label: "AI Chat", href: "/chat", icon: MessageSquare, section: "Navigation" },
  { label: "Billing", href: "/billing", icon: CreditCard, section: "Navigation" },
  { label: "Scheduled Audits", href: "/scheduled", icon: Clock, section: "Navigation" },
  { label: "On-Page Audit", href: "/audit?agent=ONPAGE", icon: Search, section: "Agents" },
  { label: "Technical SEO", href: "/audit?agent=TECHNICAL", icon: Cog, section: "Agents" },
  { label: "Off-Site Authority", href: "/audit?agent=OFFSITE", icon: Link2, section: "Agents" },
  { label: "Content Strategy", href: "/audit?agent=CONTENT", icon: FileEdit, section: "Agents" },
  { label: "Competitor Intel", href: "/audit?agent=COMPETITOR", icon: Target, section: "Agents" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();

  const filtered = query
    ? COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS;

  const toggle = useCallback(() => {
    setOpen((o) => !o);
    setQuery("");
    setSelected(0);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, toggle]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  function handleSelect(href: string) {
    setOpen(false);
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && filtered[selected]) {
      handleSelect(filtered[selected].href);
    }
  }

  if (!open) return null;

  const sections = Array.from(new Set(filtered.map((c) => c.section)));

  return (
    <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Palette */}
      <div
        className="relative mx-auto mt-[15vh] w-full max-w-lg animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages, agents, tools..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground/50 outline-none"
            />
            <kbd className="hidden sm:flex items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[50vh] overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No results found</p>
            ) : (
              sections.map((section) => (
                <div key={section}>
                  <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                    {section}
                  </p>
                  {filtered
                    .filter((c) => c.section === section)
                    .map((cmd) => {
                      const globalIdx = filtered.indexOf(cmd);
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.href}
                          onClick={() => handleSelect(cmd.href)}
                          onMouseEnter={() => setSelected(globalIdx)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                            selected === globalIdx
                              ? "bg-primary/10 text-primary"
                              : "text-foreground/80 hover:bg-muted"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-left">{cmd.label}</span>
                          {selected === globalIdx && (
                            <span className="text-[10px] text-muted-foreground">Enter</span>
                          )}
                        </button>
                      );
                    })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↵</kbd>
                Open
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground/50">Agents Hub</span>
          </div>
        </div>
      </div>
    </div>
  );
}
