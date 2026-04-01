"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { CheckCircle2, AlertCircle, Key, Lock, Shield, Zap, Eye, EyeOff, User, Mail } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [apiKeyStatus, setApiKeyStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwStatus, setPwStatus] = useState<{ ok: boolean; msg: string } | null>(null);

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
      setPwStatus({ ok: false, msg: "Network error — try again" });
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="Settings" subtitle="Account & Config" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-2xl">

        {/* Profile info (read-only) */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15">
              <User className="h-4 w-4 text-indigo-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Profile</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Name</p>
              <p className="text-sm font-medium text-white">{user?.name || "—"}</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm font-medium text-white">{user?.email || "—"}</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Role</p>
              <p className="text-sm font-medium text-white capitalize">{user?.role?.toLowerCase() || "—"}</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">User ID</p>
              <p className="text-xs font-mono text-white/40 truncate">{user?.id || "—"}</p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15">
              <Lock className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Change Password</h2>
              <p className="text-xs text-white/30">Update your account password</p>
            </div>
          </div>
          <form onSubmit={changePassword} className="space-y-3">
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-10 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-10 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50"
            />

            {pwStatus && (
              <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${pwStatus.ok ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                {pwStatus.ok ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                {pwStatus.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={pwLoading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
            >
              <Lock className="h-3.5 w-3.5" />
              {pwLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* GitHub Models API */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
              <Key className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">GitHub Models API</h2>
              <p className="text-xs text-white/30">GPT-5, DeepSeek V3, Llama 4 — via GitHub PAT</p>
            </div>
          </div>

          <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 font-mono">GITHUB_MODELS_TOKEN</span>
              <span className="text-xs text-white/20">.env.local</span>
            </div>
            <p className="mt-1 text-sm text-white/50">github_pat_••••••••••••••••••••••</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={checkApiKey}
              disabled={apiKeyStatus === "checking"}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/60 transition-all hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
            >
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
                <AlertCircle className="h-4 w-4" /> Key missing or invalid — update .env.local
              </span>
            )}
          </div>
        </div>

        {/* Security info */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
              <Shield className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Security</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: "Authentication", value: "NextAuth.js (Credentials)", ok: true },
              { label: "Password Hashing", value: "bcrypt (cost factor 12)", ok: true },
              { label: "Session Strategy", value: "JWT (encrypted)", ok: true },
              { label: "Database", value: "SQLite (Prisma ORM)", ok: true },
            ].map(({ label, value, ok }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-xs text-white/40">{label}</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span className="text-xs text-white/60">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
