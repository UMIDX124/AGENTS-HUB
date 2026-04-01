"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AGENTS } from "@/lib/agents";
import { PERMISSIONS } from "@/lib/permissions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { RoleName } from "@/types";
import {
  LayoutDashboard,
  Search,
  Settings,
  FolderOpen,
  ListTodo,
  Users,
  FileText,
  Pin,
  LogOut,
  Cog,
  Link2,
  FileEdit,
  Target,
  Zap,
  ChevronRight,
  Wrench,
} from "lucide-react";
import { signOut } from "next-auth/react";

const agentIcons: Record<string, React.ElementType> = {
  ONPAGE: Search,
  TECHNICAL: Cog,
  OFFSITE: Link2,
  CONTENT: FileEdit,
  COMPETITOR: Target,
};

const agentColors: Record<string, string> = {
  ONPAGE: "#818cf8",
  TECHNICAL: "#22d3ee",
  OFFSITE: "#a78bfa",
  CONTENT: "#34d399",
  COMPETITOR: "#fbbf24",
};

interface SidebarProps {
  user: { name: string; role: RoleName; image?: string | null };
  onNavigate?: () => void;
}

export function Sidebar({ user, onNavigate }: SidebarProps) {
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
    key,
  }));

  const managementItems = [
    { href: "/tools", icon: Wrench, label: "SEO Tools" },
    { href: "/projects", icon: FolderOpen, label: "Projects" },
    { href: "/tasks", icon: ListTodo, label: "Tasks" },
    ...(roleConfig.can.includes("manage_team")
      ? [{ href: "/team", icon: Users, label: "Team" }]
      : []),
    { href: "/reports", icon: FileText, label: "Reports" },
    { href: "/pinboard", icon: Pin, label: "Pinboard" },
  ];

  const isAuditActive = pathname === "/audit";

  function NavLink({
    href,
    icon: Icon,
    label,
    isActive,
    color,
    compact,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    color?: string;
    compact?: boolean;
  }) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          "relative flex items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
          compact ? "py-1.5" : "py-2",
          isActive
            ? "nav-active bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
      >
        {color ? (
          <div
            className="flex size-6 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="size-3.5" style={{ color }} />
          </div>
        ) : (
          <Icon
            className={cn(
              "size-4 shrink-0",
              isActive ? "text-primary" : ""
            )}
          />
        )}
        <span className={compact ? "text-xs" : ""}>{label}</span>
        {isActive && !compact && (
          <ChevronRight className="ml-auto size-3 text-muted-foreground" />
        )}
        {isActive && compact && (
          <div
            className="ml-auto size-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
      </Link>
    );
  }

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-r border-sidebar-border bg-sidebar">
      {/* Brand */}
      <Link
        href="/"
        className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground shadow-md shadow-primary/30">
          S
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-foreground">
            SEO Agents
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Hub
          </p>
        </div>
      </Link>

      {/* Scrollable nav */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {/* Overview */}
          <div>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Overview
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                isActive={pathname === item.href}
              />
            ))}
          </div>

          {/* AI Agents */}
          <div>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              AI Agents
            </p>
            <NavLink
              href="/audit"
              icon={Zap}
              label="Run Audit"
              isActive={
                isAuditActive &&
                (typeof window === "undefined" ||
                  !new URLSearchParams(window.location.search).get("agent"))
              }
            />
            <div className="mt-1 space-y-0.5">
              {agentItems.map((item) => {
                const isActive =
                  isAuditActive &&
                  typeof window !== "undefined" &&
                  new URLSearchParams(window.location.search).get("agent") ===
                    item.key;
                return (
                  <NavLink
                    key={item.key}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    color={item.color}
                    isActive={isActive}
                    compact
                  />
                );
              })}
            </div>
          </div>

          {/* Management */}
          <div>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Management
            </p>
            <div className="space-y-0.5">
              {managementItems.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  isActive={
                    pathname.startsWith(item.href) && item.href !== "/"
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Bottom: settings + user + logout */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {roleConfig.can.includes("manage_settings") && (
          <NavLink
            href="/settings"
            icon={Settings}
            label="Settings"
            isActive={pathname === "/settings"}
          />
        )}

        <Separator className="opacity-50" />

        {/* User row */}
        <div className="flex items-center gap-3 rounded-lg bg-accent/50 px-3 py-2.5">
          <Avatar className="size-8">
            <AvatarFallback
              className="text-xs font-bold"
              style={{
                backgroundColor: `${roleConfig.color}20`,
                color: roleConfig.color,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {user.name}
            </p>
            <Badge
              variant="outline"
              className="mt-0.5 h-4 px-1.5 text-[9px] font-semibold"
              style={{
                borderColor: `${roleConfig.color}30`,
                color: roleConfig.color,
              }}
            >
              {roleConfig.label}
            </Badge>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Logout</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
