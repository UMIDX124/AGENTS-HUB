"use client";

import { useState, useEffect } from "react";
import { Bot, Cpu, Sparkles } from "lucide-react";

export type AIProvider = "github" | "openrouter" | "claude";

const PROVIDERS: { id: AIProvider; name: string; badge: string; color: string; icon: any; desc: string }[] = [
  { id: "github", name: "GitHub Models", badge: "FREE", color: "#34d399", icon: Bot, desc: "GPT-5, DeepSeek V3" },
  { id: "openrouter", name: "OpenRouter", badge: "FREE", color: "#818cf8", icon: Cpu, desc: "Nemotron, Qwen 3.6" },
  { id: "claude", name: "Claude", badge: "PREMIUM", color: "#fbbf24", icon: Sparkles, desc: "Best quality" },
];

export function ProviderSelect({ value, onChange }: { value: AIProvider; onChange: (v: AIProvider) => void }) {
  return (
    <div className="flex gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
      {PROVIDERS.map((p) => {
        const Icon = p.icon;
        const active = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all ${
              active
                ? "bg-white/[0.08] text-white shadow-sm"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            <Icon className="h-3 w-3" style={{ color: active ? p.color : undefined }} />
            <span className="hidden sm:inline">{p.name}</span>
            <span
              className="rounded px-1 py-0.5 text-[9px] font-bold"
              style={{
                backgroundColor: active ? `${p.color}20` : "transparent",
                color: active ? p.color : "inherit",
              }}
            >
              {p.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function useProvider(): [AIProvider, (v: AIProvider) => void] {
  const [provider, setProvider] = useState<AIProvider>("github");

  useEffect(() => {
    const saved = localStorage.getItem("seo-ai-provider") as AIProvider;
    if (saved && ["github", "openrouter", "claude"].includes(saved)) {
      setProvider(saved);
    }
  }, []);

  function set(v: AIProvider) {
    setProvider(v);
    localStorage.setItem("seo-ai-provider", v);
  }

  return [provider, set];
}
