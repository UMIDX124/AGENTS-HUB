"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PermissionMatrix } from "@/components/permission-matrix";
import { PERMISSIONS } from "@/lib/permissions";
import { Plus, Trash2, UserCog } from "lucide-react";
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

  useEffect(() => {
    fetch("/api/team").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setMembers(data);
    });
  }, []);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (res.ok) {
      setShowForm(false);
      setName(""); setEmail(""); setPassword(""); setRole("SPECIALIST");
      fetch("/api/team").then((r) => r.json()).then(setMembers);
    }
  }

  async function removeMember(userId: string) {
    if (!confirm("Remove this team member?")) return;
    await fetch("/api/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setMembers((prev) => prev.filter((m) => m.id !== userId));
  }

  async function changeRole(userId: string, newRole: RoleName) {
    await fetch("/api/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m)));
  }

  return (
    <div>
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="Team Management" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Team Members</h2>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" /> Add Member
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-base">Add New Member</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={addMember} className="space-y-3">
                <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as RoleName)}
                  className="h-9 w-full rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-transparent px-3 text-sm"
                >
                  <option value="SPECIALIST">SEO Specialist</option>
                  <option value="MANAGER">Manager</option>
                  <option value="CLIENT">Client</option>
                </select>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">Add</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Member list */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {members.map((m) => {
                const config = PERMISSIONS[m.role as RoleName];
                return (
                  <div key={m.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold"
                        style={{ backgroundColor: `${config?.color}20`, color: config?.color }}
                      >
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-[#64748b]">{m.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="rounded-md px-2 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: `${config?.color}20`, color: config?.color }}
                      >
                        {config?.icon} {config?.label}
                      </span>
                      <span className="text-xs text-[#64748b]">
                        {new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                      {user?.role === "OWNER" && m.id !== user?.id && (
                        <div className="flex gap-1">
                          <select
                            value={m.role}
                            onChange={(e) => changeRole(m.id, e.target.value as RoleName)}
                            className="h-7 rounded border border-[rgba(255,255,255,0.06)] bg-transparent px-2 text-xs"
                          >
                            <option value="OWNER">Owner</option>
                            <option value="MANAGER">Manager</option>
                            <option value="SPECIALIST">Specialist</option>
                            <option value="CLIENT">Client</option>
                          </select>
                          <button onClick={() => removeMember(m.id)} className="rounded p-1 text-[#64748b] hover:bg-red-500/10 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Permission matrix */}
        <h3 className="mb-4 text-lg font-semibold">Permission Matrix</h3>
        <PermissionMatrix />
      </div>
    </div>
  );
}
