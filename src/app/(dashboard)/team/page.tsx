"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { PermissionMatrix } from "@/components/permission-matrix";
import { PERMISSIONS } from "@/lib/permissions";
import { Plus, Trash2, Users, X, ShieldCheck, Trophy, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/breadcrumbs";
import type { RoleName } from "@/types";

export default function TeamPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [members, setMembers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleName>("SPECIALIST");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "permissions" | "leaderboard">("members");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/team").then((r) => r.json()).then((data) => { if (Array.isArray(data)) setMembers(data); });
    fetch("/api/team/stats").then((r) => r.json()).then((data) => { if (Array.isArray(data)) setLeaderboard(data); }).catch(() => {});
  }, []);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    setLoading(false);
    if (res.ok) {
      setShowForm(false);
      setName(""); setEmail(""); setPassword(""); setRole("SPECIALIST");
      fetch("/api/team").then((r) => r.json()).then(setMembers);
    }
  }

  async function removeMember(userId: string) {
    if (!confirm("Remove this team member?")) return;
    await fetch("/api/team", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
    setMembers((prev) => prev.filter((m) => m.id !== userId));
  }

  async function changeRole(userId: string, newRole: RoleName) {
    await fetch("/api/team", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, role: newRole }) });
    setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m)));
  }

  return (
    <div className="min-h-screen">
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="Team" subtitle="Members & Permissions" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Tab switcher + action */}
        <div className="flex items-center justify-between">
          <div className="flex rounded-xl border border-border bg-muted/40 p-1">
            <button
              onClick={() => setActiveTab("members")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${activeTab === "members" ? "bg-teal-500/20 text-teal-300" : "text-muted-foreground hover:text-foreground/70"}`}
            >
              <Users className="h-3.5 w-3.5" /> Members ({members.length})
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${activeTab === "permissions" ? "bg-teal-500/20 text-teal-300" : "text-muted-foreground hover:text-foreground/70"}`}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Permissions
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${activeTab === "leaderboard" ? "bg-teal-500/20 text-teal-300" : "text-muted-foreground hover:text-foreground/70"}`}
            >
              <Trophy className="h-3.5 w-3.5" /> Leaderboard
            </button>
          </div>
          {activeTab === "members" && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> Add Member
            </button>
          )}
        </div>

        {activeTab === "members" && (
          <>
            {showForm && (
              <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Add New Team Member</h3>
                  <button onClick={() => setShowForm(false)} className="text-muted-foreground/70 hover:text-muted-foreground"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={addMember} className="grid gap-3 sm:grid-cols-2">
                  <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required
                    className="rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50" />
                  <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50" />
                  <input type="password" placeholder="Set password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50" />
                  <select value={role} onChange={(e) => setRole(e.target.value as RoleName)}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-teal-500/50">
                    <option value="SPECIALIST">SEO Specialist</option>
                    <option value="MANAGER">Manager</option>
                    <option value="CLIENT">Client</option>
                  </select>
                  <div className="col-span-2 flex gap-2">
                    <button type="submit" disabled={loading}
                      className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60">
                      {loading ? "Adding..." : "Add Member"}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)}
                      className="rounded-xl border border-border px-4 py-2 text-sm text-white/50 hover:text-foreground">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {members.length > 0 ? (
              <div className="rounded-2xl border border-border bg-muted/40 overflow-hidden">
                <div className="divide-y divide-white/[0.04]">
                  {members.map((m) => {
                    const config = PERMISSIONS[m.role as RoleName];
                    return (
                      <div key={m.id} className="flex items-center justify-between px-5 py-4 transition-all hover:bg-muted/40">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold"
                            style={{ backgroundColor: `${config?.color}20`, color: config?.color }}>
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground/90">{m.name}</p>
                            <p className="text-xs text-muted-foreground/70">{m.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-lg px-2.5 py-1 text-xs font-semibold"
                            style={{ backgroundColor: `${config?.color}18`, color: config?.color }}>
                            {config?.label}
                          </span>
                          <span className="hidden text-xs text-muted-foreground/50 sm:block">
                            {new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                          </span>
                          {user?.role === "OWNER" && m.id !== user?.id && (
                            <div className="flex items-center gap-1">
                              <select value={m.role} onChange={(e) => changeRole(m.id, e.target.value as RoleName)}
                                className="h-8 rounded-lg border border-border bg-card px-2 text-xs text-white outline-none">
                                <option value="OWNER">Owner</option>
                                <option value="MANAGER">Manager</option>
                                <option value="SPECIALIST">Specialist</option>
                                <option value="CLIENT">Client</option>
                              </select>
                              <button onClick={() => removeMember(m.id)}
                                className="rounded-lg p-1.5 text-muted-foreground/50 transition-all hover:bg-red-500/10 hover:text-red-400">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10">
                  <Users className="h-7 w-7 text-teal-400" />
                </div>
                <p className="text-sm font-semibold text-foreground">No team members yet</p>
                <p className="mt-1 text-xs text-muted-foreground/70">Add your first team member to collaborate</p>
              </div>
            )}
          </>
        )}

        {activeTab === "permissions" && (
          <div className="rounded-2xl border border-border bg-muted/40 p-5">
            <PermissionMatrix />
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="rounded-2xl border border-border bg-muted/40 overflow-hidden">
            <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">Team Leaderboard</h3>
            </div>
            {leaderboard.length > 0 ? (
              <div className="divide-y divide-border/50">
                {leaderboard.map((member, idx) => {
                  const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
                  return (
                    <div key={member.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-base w-8 text-center">{medal}</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{member.name}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{member.role.toLowerCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-center">
                          <p className="font-bold text-foreground tabular-nums">{member.totalAudits}</p>
                          <p className="text-[10px] text-muted-foreground">Audits</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-foreground tabular-nums">{member.weeklyAudits}</p>
                          <p className="text-[10px] text-muted-foreground">This Week</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-foreground tabular-nums">{member.totalTasks}</p>
                          <p className="text-[10px] text-muted-foreground">Tasks</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="p-8 text-center text-sm text-muted-foreground">No data yet — run some audits to see the leaderboard</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
