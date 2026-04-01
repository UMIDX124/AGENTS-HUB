"use client";

import { useState } from "react";
import { PERMISSIONS } from "@/lib/permissions";
import type { RoleName } from "@/types";
import { Bell, Sparkles, X } from "lucide-react";

interface TopbarProps {
  user: { name: string; role: RoleName };
  title?: string;
  subtitle?: string;
}

export function Topbar({ user, title, subtitle }: TopbarProps) {
  const roleConfig = PERMISSIONS[user.role];
  const [showNotif, setShowNotif] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#04050b]/80 px-6 backdrop-blur-xl">
      <div>
        {subtitle ? (
          <>
            <p className="text-[10px] font-medium uppercase tracking-widest text-white/25">{title}</p>
            <h1 className="text-base font-bold tracking-tight text-white">{subtitle}</h1>
          </>
        ) : (
          <h1 className="text-base font-bold tracking-tight text-white">{title || "Dashboard"}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Greeting badge */}
        <div className="hidden items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 md:flex">
          <Sparkles className="h-3 w-3 text-indigo-400" />
          <span className="text-xs text-white/50">{greeting}, <span className="font-semibold text-white/80">{user.name.split(" ")[0]}</span></span>
        </div>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/40 transition-all hover:bg-white/[0.06] hover:text-white/80"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-1 ring-[#04050b]" />
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-72 rounded-2xl border border-white/[0.08] bg-[#0a0b12] shadow-2xl shadow-black/50 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <h3 className="text-xs font-semibold text-white">Notifications</h3>
                <button onClick={() => setShowNotif(false)} className="text-white/30 hover:text-white/60">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="p-3 space-y-2">
                <div className="rounded-xl bg-white/[0.03] p-3">
                  <p className="text-xs text-white/60">Welcome to SEO Agents Hub!</p>
                  <p className="text-[10px] text-white/25 mt-1">Run your first audit to get started</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-3">
                  <p className="text-xs text-white/60">14 SEO Tools available</p>
                  <p className="text-[10px] text-white/25 mt-1">Generate meta tags, schema, content & more</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-3">
                  <p className="text-xs text-white/60">Powered by GPT-5</p>
                  <p className="text-[10px] text-white/25 mt-1">Free AI via GitHub Models</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role badge */}
        <div
          className="flex items-center gap-2 rounded-xl border px-3 py-1.5"
          style={{ borderColor: `${roleConfig.color}25`, backgroundColor: `${roleConfig.color}10` }}
        >
          <div
            className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold"
            style={{ backgroundColor: `${roleConfig.color}20`, color: roleConfig.color }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-white/80 leading-none">{user.name.split(" ")[0]}</p>
            <p className="text-[10px] leading-none mt-0.5" style={{ color: roleConfig.color }}>{roleConfig.label}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
