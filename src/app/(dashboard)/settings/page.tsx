"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { CheckCircle2, AlertCircle, Key, Lock, Shield, Zap, Eye, EyeOff, User, UserPlus, Pencil, X, Palette, Building2 } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  // Profile edit
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [nameStatus, setNameStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // Password
  const [apiKeyStatus, setApiKeyStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwStatus, setPwStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // White-label settings (OWNER only)
  const [wlCompany, setWlCompany] = useState("");
  const [wlLogo, setWlLogo] = useState("");
  const [wlAccent, setWlAccent] = useState("#818cf8");
  const [wlLoading, setWlLoading] = useState(false);
  const [wlStatus, setWlStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  useState(() => {
    fetch("/api/settings/whitelabel").then((r) => r.json()).then((data) => {
      if (data.companyName) setWlCompany(data.companyName);
      if (data.logoUrl) setWlLogo(data.logoUrl);
      if (data.accentColor) setWlAccent(data.accentColor);
    }).catch(() => {});
  });

  async function saveWhiteLabel(e: React.FormEvent) {
    e.preventDefault();
    setWlLoading(true);
    setWlStatus(null);
    try {
      const res = await fetch("/api/settings/whitelabel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: wlCompany, logoUrl: wlLogo, accentColor: wlAccent }),
      });
      if (res.ok) {
        setWlStatus({ ok: true, msg: "White-label settings saved! PDF exports will use these." });
      } else {
        const data = await res.json();
        setWlStatus({ ok: false, msg: data.error });
      }
    } catch {
      setWlStatus({ ok: false, msg: "Network error" });
    } finally {
      setWlLoading(false);
    }
  }

  // Employee creation (OWNER only)
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [empRole, setEmpRole] = useState("SPECIALIST");
  const [empLoading, setEmpLoading] = useState(false);
  const [empStatus, setEmpStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  function checkApiKey() {
    setApiKeyStatus("checking");
    fetch("/api/agents/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://test.com", agent: "ONPAGE" }),
    }).then((res) => {
      setApiKeyStatus(res.status === 200 || res.status === 400 ? "valid" : "invalid");
    }).catch(() => setApiKeyStatus("invalid"));
  }

  async function saveName() {
    setNameStatus(null);
    const res = await fetch("/api/settings/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json();
    if (res.ok) {
      setNameStatus({ ok: true, msg: "Name updated! Refresh to see changes." });
      setEditName(false);
    } else {
      setNameStatus({ ok: false, msg: data.error });
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwStatus(null);
    if (newPassword !== confirmPassword) {
      setPwStatus({ ok: false, msg: "New passwords do not match" });
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwStatus({ ok: true, msg: "Password updated successfully!" });
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        setPwStatus({ ok: false, msg: data.error || "Failed to update password" });
      }
    } catch {
      setPwStatus({ ok: false, msg: "Network error" });
    } finally {
      setPwLoading(false);
    }
  }

  async function createEmployee(e: React.FormEvent) {
    e.preventDefault();
    setEmpStatus(null);
    setEmpLoading(true);
    try {
      const res = await fetch("/api/settings/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: empName, email: empEmail, password: empPassword, role: empRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmpStatus({ ok: true, msg: `${data.user.name} (${data.user.role}) created!` });
        setEmpName(""); setEmpEmail(""); setEmpPassword(""); setEmpRole("SPECIALIST");
      } else {
        setEmpStatus({ ok: false, msg: data.error });
      }
    } catch {
      setEmpStatus({ ok: false, msg: "Network error" });
    } finally {
      setEmpLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="Settings" subtitle="Account & Config" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-2xl">

        {/* Profile */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15">
                <User className="h-4 w-4 text-indigo-400" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Profile</h2>
            </div>
            {!editName && (
              <button onClick={() => { setEditName(true); setNewName(user?.name || ""); }}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                <Pencil className="h-3 w-3" /> Edit
              </button>
            )}
          </div>

          {editName ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1 block">Display Name</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50" />
              </div>
              <div className="flex gap-2">
                <button onClick={saveName}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-foreground">
                  Save
                </button>
                <button onClick={() => setEditName(false)}
                  className="flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-xs text-muted-foreground hover:text-muted-foreground">
                  <X className="h-3 w-3" /> Cancel
                </button>
              </div>
              {nameStatus && (
                <p className={`text-xs ${nameStatus.ok ? "text-emerald-400" : "text-red-400"}`}>{nameStatus.msg}</p>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
                <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1">Name</p>
                <p className="text-sm font-medium text-foreground">{user?.name || "—"}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
                <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm font-medium text-white truncate">{user?.email || "—"}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
                <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1">Role</p>
                <p className="text-sm font-medium text-white capitalize">{user?.role?.toLowerCase() || "—"}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
                <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1">User ID</p>
                <p className="text-xs font-mono text-muted-foreground truncate">{user?.id || "—"}</p>
              </div>
            </div>
          )}
        </div>

        {/* White-Label PDF (OWNER only) */}
        {user?.role === "OWNER" && (
          <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15">
                <Building2 className="h-4 w-4 text-violet-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">White-Label PDF</h2>
                <p className="text-xs text-muted-foreground/70">Customize PDF exports with your brand</p>
              </div>
            </div>
            <form onSubmit={saveWhiteLabel} className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1 block">Company Name</label>
                <input
                  value={wlCompany}
                  onChange={(e) => setWlCompany(e.target.value)}
                  placeholder="Your Company Name"
                  className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-indigo-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1 block">Logo URL</label>
                <input
                  value={wlLogo}
                  onChange={(e) => setWlLogo(e.target.value)}
                  placeholder="https://your-site.com/logo.png"
                  className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-indigo-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1 block">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={wlAccent}
                    onChange={(e) => setWlAccent(e.target.value)}
                    className="h-10 w-14 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    value={wlAccent}
                    onChange={(e) => setWlAccent(e.target.value)}
                    className="flex-1 rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-foreground font-mono outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              {wlStatus && (
                <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${wlStatus.ok ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                  {wlStatus.ok ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                  {wlStatus.msg}
                </div>
              )}

              <button type="submit" disabled={wlLoading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:brightness-110 disabled:opacity-60">
                <Palette className="h-3.5 w-3.5" />
                {wlLoading ? "Saving..." : "Save White-Label Settings"}
              </button>
            </form>
          </div>
        )}

        {/* Create Employee (OWNER only) */}
        {user?.role === "OWNER" && (
          <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                <UserPlus className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Create New Employee</h2>
                <p className="text-xs text-muted-foreground/70">Add team members with login credentials</p>
              </div>
            </div>
            <form onSubmit={createEmployee} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input placeholder="Full name" value={empName} onChange={(e) => setEmpName(e.target.value)} required
                  className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-white placeholder-muted-foreground/50 outline-none focus:border-indigo-500/50" />
                <input type="email" placeholder="Email address" value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} required
                  className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-white placeholder-muted-foreground/50 outline-none focus:border-indigo-500/50" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="password" placeholder="Password (min 6 chars)" value={empPassword} onChange={(e) => setEmpPassword(e.target.value)} required
                  className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-white placeholder-muted-foreground/50 outline-none focus:border-indigo-500/50" />
                <select value={empRole} onChange={(e) => setEmpRole(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50">
                  <option value="SPECIALIST">SEO Specialist</option>
                  <option value="MANAGER">Manager</option>
                  <option value="OWNER">Owner</option>
                  <option value="CLIENT">Client (view only)</option>
                </select>
              </div>

              {empStatus && (
                <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${empStatus.ok ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                  {empStatus.ok ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                  {empStatus.msg}
                </div>
              )}

              <button type="submit" disabled={empLoading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:brightness-110 disabled:opacity-60">
                <UserPlus className="h-3.5 w-3.5" />
                {empLoading ? "Creating..." : "Create Employee"}
              </button>
            </form>
          </div>
        )}

        {/* Change Password */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15">
              <Lock className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Change Password</h2>
              <p className="text-xs text-muted-foreground/70">Update your account password</p>
            </div>
          </div>
          <form onSubmit={changePassword} className="space-y-3">
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} placeholder="Current password" value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)} required
                className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 pr-10 text-sm text-white placeholder-muted-foreground/50 outline-none focus:border-indigo-500/50" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-white/50">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <input type={showNew ? "text" : "password"} placeholder="New password (min 6 chars)" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} required
                className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 pr-10 text-sm text-white placeholder-muted-foreground/50 outline-none focus:border-indigo-500/50" />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-white/50">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <input type="password" placeholder="Confirm new password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} required
              className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-white placeholder-muted-foreground/50 outline-none focus:border-indigo-500/50" />

            {pwStatus && (
              <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${pwStatus.ok ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                {pwStatus.ok ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                {pwStatus.msg}
              </div>
            )}

            <button type="submit" disabled={pwLoading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60">
              <Lock className="h-3.5 w-3.5" />
              {pwLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* AI Provider Configuration */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
              <Key className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">AI Provider</h2>
              <p className="text-xs text-muted-foreground/70">Multi-model AI engine configuration</p>
            </div>
          </div>
          <div className="mb-4 rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">GITHUB_MODELS_TOKEN</span>
              <span className="text-xs text-muted-foreground/50">.env.local</span>
            </div>
            <p className="mt-1 text-sm text-white/50">github_pat_••••••••••••••••••••••</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={checkApiKey} disabled={apiKeyStatus === "checking"}
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/80 hover:text-white disabled:opacity-50">
              <Zap className="h-3.5 w-3.5" />
              {apiKeyStatus === "checking" ? "Checking..." : "Test Connection"}
            </button>
            {apiKeyStatus === "valid" && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> API key is working
              </span>
            )}
            {apiKeyStatus === "invalid" && (
              <span className="flex items-center gap-1.5 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" /> Key missing or invalid
              </span>
            )}
          </div>
        </div>

        {/* Security info */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
              <Shield className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Security</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: "Authentication", value: "NextAuth.js (Credentials)", ok: true },
              { label: "Password Hashing", value: "bcrypt (cost factor 12)", ok: true },
              { label: "Session Strategy", value: "JWT (encrypted)", ok: true },
              { label: "Database", value: "SQLite (Prisma ORM)", ok: true },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted-foreground">{label}</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span className="text-xs text-muted-foreground">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
