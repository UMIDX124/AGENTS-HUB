"use client";

import { AGENTS } from "@/lib/agents";
import type { AgentTypeName } from "@/types";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface AgentCardProps {
  agentType: AgentTypeName;
  onClick?: () => void;
  isActive?: boolean;
  hasResults?: boolean;
}

export function AgentCard({
  agentType,
  onClick,
  isActive,
  hasResults,
}: AgentCardProps) {
  const agent = AGENTS[agentType];

  return (
    <Card
      onClick={onClick}
      className={cn(
        "hover-lift group relative cursor-pointer overflow-hidden text-center transition-all",
        isActive
          ? "border-primary/30 bg-primary/5 shadow-lg"
          : "hover:border-border/80"
      )}
      style={isActive ? { boxShadow: `0 0 30px ${agent.color}15` } : undefined}
    >
      <CardContent className="relative flex flex-col items-center gap-3 p-5">
        {/* Active dot */}
        {hasResults && (
          <div
            className="absolute right-3 top-3 size-2 rounded-full pulse-dot"
            style={{
              backgroundColor: agent.color,
              boxShadow: `0 0 10px ${agent.color}`,
            }}
          />
        )}

        {/* Icon with glow */}
        <div className="relative">
          <div
            className="flex size-12 items-center justify-center rounded-xl text-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
            style={{
              backgroundColor: `${agent.color}12`,
              boxShadow: isActive ? `0 0 20px ${agent.color}30` : undefined,
            }}
          >
            {agent.icon}
          </div>
          {isActive && (
            <div
              className="absolute -inset-2 rounded-xl blur-md opacity-20 animate-pulse"
              style={{ backgroundColor: agent.color }}
            />
          )}
        </div>

        {/* Label */}
        <div className="space-y-1">
          <p
            className="text-xs font-bold tracking-tight"
            style={{ color: agent.color }}
          >
            {agent.name}
          </p>
          <p className="line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
            {agent.description.slice(0, 70)}
          </p>
        </div>

        {/* Hover action */}
        <div
          className="flex items-center gap-1 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: agent.color }}
        >
          <Zap className="size-3" />
          Run Agent
        </div>
      </CardContent>
    </Card>
  );
}
