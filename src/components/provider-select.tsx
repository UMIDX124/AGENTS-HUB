"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Cpu, Sparkles, Flame } from "lucide-react";

export type AIProvider = "gemini" | "github" | "openrouter" | "claude";

const PROVIDERS: {
  id: AIProvider;
  name: string;
  badge: string;
  badgeVariant: "success" | "default" | "warning";
  icon: React.ElementType;
  desc: string;
}[] = [
  {
    id: "gemini",
    name: "Gemini",
    badge: "FAST",
    badgeVariant: "success",
    icon: Flame,
    desc: "Fast & generous limits",
  },
  {
    id: "github",
    name: "GitHub",
    badge: "AUTO",
    badgeVariant: "success",
    icon: Bot,
    desc: "Multi-model routing",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    badge: "MULTI",
    badgeVariant: "default",
    icon: Cpu,
    desc: "DeepSeek, Llama 4",
  },
  {
    id: "claude",
    name: "Claude",
    badge: "PRO",
    badgeVariant: "warning",
    icon: Sparkles,
    desc: "Best quality",
  },
];

export function ProviderSelect({
  value,
  onChange,
}: {
  value: AIProvider;
  onChange: (v: AIProvider) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
      {PROVIDERS.map((p) => {
        const Icon = p.icon;
        const active = value === p.id;
        return (
          <Button
            key={p.id}
            type="button"
            variant={active ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onChange(p.id)}
            className="gap-1.5 text-xs"
          >
            <Icon className="size-3" />
            <span className="hidden sm:inline">{p.name}</span>
            <Badge
              variant={active ? p.badgeVariant : "outline"}
              className="h-4 px-1 text-[9px]"
            >
              {p.badge}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}

export function useProvider(): [AIProvider, (v: AIProvider) => void] {
  const [provider, setProvider] = useState<AIProvider>("gemini");

  useEffect(() => {
    const saved = localStorage.getItem("seo-ai-provider") as AIProvider;
    if (saved && ["gemini", "github", "openrouter", "claude"].includes(saved)) {
      setProvider(saved);
    }
  }, []);

  function set(v: AIProvider) {
    setProvider(v);
    localStorage.setItem("seo-ai-provider", v);
  }

  return [provider, set];
}
