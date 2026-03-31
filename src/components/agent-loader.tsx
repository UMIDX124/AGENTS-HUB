"use client";

import { useEffect, useState } from "react";

const PHASES = [
  "Initiating crawl...",
  "Scanning DOM structure...",
  "Analyzing SEO signals...",
  "Cross-referencing data...",
  "Calculating scores...",
  "Compiling report...",
];

interface AgentLoaderProps {
  agentIcon: string;
  agentColor: string;
  agentName: string;
}

export function AgentLoader({ agentIcon, agentColor, agentName }: AgentLoaderProps) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhase((p) => (p + 1) % PHASES.length);
    }, 2500);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 1, 95));
    }, 300);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      {/* Dual spinning rings */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div
          className="animate-spin-slow absolute inset-0 rounded-full border-2 border-transparent"
          style={{ borderTopColor: agentColor, borderRightColor: agentColor }}
        />
        <div
          className="animate-spin-reverse absolute inset-2 rounded-full border-2 border-transparent"
          style={{ borderBottomColor: agentColor, borderLeftColor: `${agentColor}60` }}
        />
        <span className="text-3xl">{agentIcon}</span>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium" style={{ color: agentColor }}>
          {agentName}
        </p>
        <p className="mt-1 text-sm text-[#94a3b8] animate-pulse">{PHASES[phase]}</p>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-48 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: agentColor }}
        />
      </div>
    </div>
  );
}
