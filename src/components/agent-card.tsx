"use client";

import { AGENTS } from "@/lib/agents";
import type { AgentTypeName } from "@/types";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface AgentCardProps {
  agentType: AgentTypeName;
  onClick?: () => void;
  isActive?: boolean;
  hasResults?: boolean;
}

const agentGrads: Record<string, string> = {
  ONPAGE:     "from-indigo-500/15 via-indigo-600/5 to-transparent",
  TECHNICAL:  "from-cyan-500/15 via-cyan-600/5 to-transparent",
  OFFSITE:    "from-purple-500/15 via-purple-600/5 to-transparent",
  CONTENT:    "from-emerald-500/15 via-emerald-600/5 to-transparent",
  COMPETITOR: "from-amber-500/15 via-amber-600/5 to-transparent",
};

export function AgentCard({ agentType, onClick, isActive, hasResults }: AgentCardProps) {
  const agent = AGENTS[agentType];
  const grad = agentGrads[agentType];

  return (
    <button
      onClick={onClick}
      className={cn(
        "card-hover group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border p-5 text-center transition-all",
        isActive
          ? "border-opacity-40"
          : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
      )}
      style={isActive ? { borderColor: `${agent.color}40`, backgroundColor: `${agent.color}06` } : {}}
    >
      {/* Gradient background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-b opacity-0 transition-opacity duration-300",
        grad,
        isActive ? "opacity-100" : "group-hover:opacity-60"
      )} />

      {/* Active dot */}
      {hasResults && (
        <div
          className="absolute right-3 top-3 h-2 w-2 rounded-full shadow-lg"
          style={{ backgroundColor: agent.color, boxShadow: `0 0 8px ${agent.color}` }}
        />
      )}

      {/* Icon */}
      <div className="relative">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${agent.color}15` }}
        >
          {agent.icon}
        </div>
        {isActive && (
          <div
            className="absolute -inset-1 rounded-2xl blur-sm opacity-40"
            style={{ backgroundColor: agent.color }}
          />
        )}
      </div>

      {/* Label */}
      <div className="relative space-y-1">
        <p className="text-xs font-bold tracking-tight" style={{ color: agent.color }}>
          {agent.name}
        </p>
        <p className="line-clamp-2 text-[10px] leading-relaxed text-white/30">
          {agent.description.slice(0, 70)}
        </p>
      </div>

      {/* Hover action */}
      <div className="relative flex items-center gap-1 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: agent.color }}>
        <Zap className="h-3 w-3" />
        Run Agent
      </div>
    </button>
  );
}
