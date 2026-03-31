"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const DEMO_ACCOUNTS = [
  { name: "Faizan (Faizi Yoyo)", email: "backupsolutions1122@gmail.com", password: "faizi13579", role: "Owner", color: "#818cf8" },
  { name: "Umi",                  email: "umidx932@gmail.com",             password: "umi84268",   role: "Manager", color: "#34d399" },
  { name: "Ali Hassan",           email: "ali@digitalpointllc.com",        password: "specialist123", role: "Specialist", color: "#22d3ee" },
  { name: "Client Demo",          email: "client@example.com",            password: "viewer123",  role: "Client", color: "#fbbf24" },
];

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Aurora background */}
      <div className="aurora-bg absolute inset-0 -z-10" />

      {/* Animated orbs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px] animate-pulse" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-purple-600/10 blur-[100px] animate-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-cyan-600/05 blur-[80px]" />

      <div className="animate-scale-in w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="animate-float relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-black shadow-2xl shadow-indigo-500/40">
              S
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 blur-sm -z-10" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">SEO Agents Hub</h1>
            <p className="mt-1 text-sm text-white/40">AI-Powered SEO Command Center</p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          <h2 className="mb-6 text-base font-semibold text-white/90">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.06]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-12 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.06]"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-xs font-medium"
                >
                  {showPwd ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                <span className="text-red-400 text-lg">⚠</span>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Quick access */}
          <div className="mt-6">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="flex w-full items-center justify-between text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-px w-6 bg-white/10" />
                Quick Access
                <span className="h-px w-6 bg-white/10" />
              </span>
              <span className="text-[10px] uppercase tracking-wider">{showDemo ? "hide ↑" : "show ↓"}</span>
            </button>

            {showDemo && (
              <div className="mt-3 space-y-2 animate-slide-up">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => { setEmail(account.email); setPassword(account.password); }}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
                  >
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                      style={{ backgroundColor: `${account.color}20`, color: account.color }}
                    >
                      {account.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/80 truncate">{account.name}</p>
                      <p className="text-[10px] text-white/30 truncate">{account.email}</p>
                    </div>
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-semibold flex-shrink-0"
                      style={{ backgroundColor: `${account.color}18`, color: account.color }}
                    >
                      {account.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] text-white/15">
          © 2025 SEO Agents Hub · Digital Point LLC
        </p>
      </div>
    </div>
  );
}
