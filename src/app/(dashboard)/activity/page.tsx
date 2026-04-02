"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import {
  Activity,
  Search as SearchIcon,
  Filter,
  Zap,
  Trash2,
  Plus,
  FileText,
  Settings,
  Pin,
  Users,
  FolderOpen,
  LogIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/breadcrumbs";

const ACTION_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  audit_run: { label: "Audit Run", icon: Zap, color: "#14b8a6" },
  audit_deleted: { label: "Audit Deleted", icon: Trash2, color: "#ef4444" },
  task_created: { label: "Task Created", icon: Plus, color: "#34d399" },
  task_updated: { label: "Task Updated", icon: FileText, color: "#fbbf24" },
  task_deleted: { label: "Task Deleted", icon: Trash2, color: "#ef4444" },
  member_added: { label: "Member Added", icon: Users, color: "#22d3ee" },
  member_removed: { label: "Member Removed", icon: Users, color: "#f97316" },
  project_created: { label: "Project Created", icon: FolderOpen, color: "#a78bfa" },
  project_updated: { label: "Project Updated", icon: FolderOpen, color: "#a78bfa" },
  project_deleted: { label: "Project Deleted", icon: Trash2, color: "#ef4444" },
  report_exported: { label: "Report Exported", icon: FileText, color: "#34d399" },
  pin_created: { label: "Pin Created", icon: Pin, color: "#fbbf24" },
  pin_deleted: { label: "Pin Deleted", icon: Trash2, color: "#ef4444" },
  settings_updated: { label: "Settings Updated", icon: Settings, color: "#94a3b8" },
  login: { label: "Login", icon: LogIn, color: "#22d3ee" },
};

function formatRelativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function ActivityPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [activities, setActivities] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "30" });
    if (filterAction) params.set("action", filterAction);
    fetch(`/api/activity?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setActivities(data.activities || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page, filterAction]);

  const totalPages = Math.ceil(total / 30);

  return (
    <div className="min-h-screen">
      <Topbar
        user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }}
        title="Activity"
        subtitle="Activity Log"
      />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-muted/40 p-3 sm:p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground">Total Actions</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-teal-500/50"
          >
            <option value="">All Actions</option>
            {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>

        {/* Activity list */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl shimmer" />
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="rounded-2xl border border-border bg-muted/40 overflow-hidden">
            <div className="divide-y divide-border/50">
              {activities.map((log) => {
                const cfg = ACTION_CONFIG[log.action] || {
                  label: log.action,
                  icon: Activity,
                  color: "#94a3b8",
                };
                const Icon = cfg.icon;
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/60"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
                          style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          by {log.user?.name || "Unknown"}
                        </span>
                      </div>
                      {log.detail && (
                        <p className="mt-0.5 text-sm text-foreground/80 truncate">
                          {log.detail}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(log.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10">
              <Activity className="h-8 w-8 text-teal-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No activity yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Actions like audits, task creation, and team changes will appear here
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
