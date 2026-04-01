"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AGENTS } from "@/lib/agents";
import { PERMISSIONS } from "@/lib/permissions";
import type { RoleName } from "@/types";
import {
  LayoutDashboard, Search, Settings, FolderOpen, ListTodo,
  Users, FileText, Pin, LogOut, Cog, Link2, FileEdit, Target, Zap,
  ChevronRight, Wrench,
} from "lucide-react";
import { signOut } from "next-auth/react";

const agentIcons: Record<string, any> = {
  ONPAGE:     Search,
  TECHNICAL:  Cog,
  OFFSITE:    Link2,
  CONTENT:    FileEdit,
  COMPETITOR: Target,
};

const agentColors: Record<string, string> = {
  ONPAGE:     "#818cf8",
  TECHNICAL:  "#22d3ee",
  OFFSITE:    "#a78bfa",
  CONTENT:    "#34d399",
  COMPETITOR: "#fbbf24",
};

const agentGrads: Record<string, string> = {
  ONPAGE:     "from-indigo-500/20 to-indigo-600/5",
  TECHNICAL:  "from-cyan-500/20 to-cyan-600/5",
  OFFSITE:    "from-purple-500/20 to-purple-600/5",
  CONTENT:    "from-emerald-500/20 to-emerald-600/5",
  COMPETITOR: "from-amber-500/20 to-amber-600/5",
};

interface SidebarProps {
  user: { name: string; role: RoleName; image?: string | null };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const roleConfig = PERMISSIONS[user.role];

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  ];

  const agentItems = Object.entries(AGENTS).map(([key, agent]) => ({
    href: `/audit?agent=${key}`,
    icon: agentIcons[key] || Zap,
    label: agent.name,
    color: agentColors[key],
    grad: agentGrads[key],
    key,
  }));

  const managementItems = [
    { href: "/tools",    icon: Wrench,      label: "SEO Tools" },
    { href: "/projects", icon: FolderOpen,  label: "Projects" },
    { href: "/tasks",    icon: ListTodo,    label: "Tasks" },
    ...(roleConfig.can.includes("manage_team")
      ? [{ href: "/team", icon: Users, label: "Team" }]
      : []),
    { href: "/reports",  icon: FileText,    label: "Reports" },
    { href: "/pinboard", icon: Pin,         label: "Pinboard" },
  ];

  const isAuditActive = pathname === "/audit";

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-white/[0.06] bg-[#04050b]">

      {/* ── Brand ── */}
      <Link
        href="/"
        className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]"
      >
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-base font-black shadow-lg shadow-indigo-500/30">
          S
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-white">SEO Agents</p>
          <p className="text-[10px] text-white/30 font-medium tracking-widest uppercase">Hub</p>
        </div>
      </Link>

      {/* ── Scrollable nav ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">

        {/* Overview */}
        <div>
          <p className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/20">Overview</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "nav-item relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "nav-active bg-gradient-to-r from-indigo-500/15 to-purple-500/5 text-white"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/80"
                )}
              >
                <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-indigo-400" : "")} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="ml-auto h-3 w-3 text-indigo-400/60" />}
              </Link>
            );
          })}
        </div>

        {/* AI Agents */}
        <div>
          <p className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/20">AI Agents</p>
          <Link
            href="/audit"
            className={cn(
              "nav-item relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-1",
              isAuditActive && !new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("agent")
                ? "nav-active bg-gradient-to-r from-indigo-500/15 to-purple-500/5 text-white"
                : "text-white/40 hover:bg-white/[0.04] hover:text-white/80"
            )}
          >
            <Zap className="h-4 w-4 flex-shrink-0 text-indigo-400" />
            <span>Run Audit</span>
          </Link>
          <div className="space-y-0.5">
            {agentItems.map((item) => {
              const isActive = isAuditActive && typeof window !== "undefined"
                ? new URLSearchParams(window.location.search).get("agent") === item.key
                : false;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                    isActive
                      ? `bg-gradient-to-r ${item.grad} font-medium`
                      : "hover:bg-white/[0.04]"
                  )}
                  style={{ color: isActive ? item.color : "rgba(255,255,255,0.35)" }}
                >
                  <div
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${item.color}18` }}
                  >
                    <item.icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Management */}
        <div>
          <p className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/20">Management</p>
          <div className="space-y-0.5">
            {managementItems.map((item) => {
              const isActive = pathname.startsWith(item.href) && item.href !== "/";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "nav-item relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "nav-active bg-gradient-to-r from-indigo-500/15 to-purple-500/5 text-white"
                      : "text-white/40 hover:bg-white/[0.04] hover:text-white/80"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-indigo-400" : "")} />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="ml-auto h-3 w-3 text-indigo-400/60" />}
                </Link>
              );
            })}
          </div>
        </div>

      </nav>

      {/* ── Bottom: user + settings + logout ── */}
      <div className="border-t border-white/[0.06] p-3 space-y-1">
        {roleConfig.can.includes("manage_settings") && (
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              pathname === "/settings" ? "bg-white/[0.06] text-white" : "text-white/40 hover:bg-white/[0.04] hover:text-white/80"
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        )}

        {/* User row */}
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold"
            style={{ backgroundColor: `${roleConfig.color}25`, color: roleConfig.color }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-semibold text-white/90">{user.name}</p>
            <p className="text-[10px] font-medium" style={{ color: roleConfig.color }}>
              {roleConfig.label}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-white/25 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
