"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const TEAM_ACCOUNTS = [
  { name: "Faizan (Faizi Yoyo)", email: "backupsolutions1122@gmail.com", role: "Owner", color: "#14b8a6" },
  { name: "Umi",                  email: "umidx932@gmail.com",             role: "Owner", color: "#14b8a6" },
  { name: "Ali Hassan",           email: "ali@digitalpointllc.com",        role: "Specialist", color: "#22d3ee" },
  { name: "Client Demo",          email: "client@example.com",            role: "Client", color: "#fbbf24" },
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

      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10" style={{
        backgroundImage: "linear-gradient(rgba(20,184,166,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Animated orbs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-teal-500/[0.07] blur-[140px] animate-pulse" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.05] blur-[140px] animate-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 h-64 w-64 rounded-full bg-violet-500/[0.04] blur-[100px]" />

      <div className="animate-scale-in w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="animate-float relative">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 drop-shadow-[0_0_30px_rgba(20,184,166,0.4)]">
              <defs>
                <linearGradient id="login-logo-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <rect width="64" height="64" rx="18" fill="url(#login-logo-grad)" />
              <path d="M18 32C18 24.3 24.3 18 32 18C36.2 18 40 19.8 42.7 22.7" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M46 32C46 39.7 39.7 46 32 46C27.8 46 24 44.2 21.3 41.3" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.7" />
              <path d="M32 25V32L37 35.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="42.7" cy="22.7" r="2.5" fill="white" />
              <circle cx="21.3" cy="41.3" r="2" fill="white" opacity="0.7" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Agents Hub</h1>
            <p className="mt-1 text-sm gradient-text font-semibold">SEO Intelligence Platform</p>
          </div>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-2xl shadow-black/20 border-glow">
          <h2 className="mb-6 text-base font-semibold text-foreground/90">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-teal-500/50 focus:bg-muted/80"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 pr-12 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-teal-500/50 focus:bg-muted/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-muted-foreground transition-colors text-xs font-medium"
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
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
              className="flex w-full items-center justify-between text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
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
                {TEAM_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => { setEmail(account.email); setPassword(""); }}
                    className="flex w-full items-center gap-3 rounded-xl border border-border/70 bg-muted/40 p-3 text-left transition-all hover:border-white/[0.1] hover:bg-muted/60"
                  >
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                      style={{ backgroundColor: `${account.color}20`, color: account.color }}
                    >
                      {account.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground/80 truncate">{account.name}</p>
                      <p className="text-[10px] text-muted-foreground/70 truncate">{account.email}</p>
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

        <p className="mt-6 text-center text-[10px] text-muted-foreground/30">
          © 2026 Agents Hub · Digital Point LLC
        </p>
      </div>
    </div>
  );
}
