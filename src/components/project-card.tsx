"use client";

import Link from "next/link";
import { ScoreRing } from "./score-ring";
import { getGrade } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    url: string;
    status: string;
    members: { user: { id: string; name: string; avatar?: string | null } }[];
    audits: { score: number }[];
    _count: { tasks: number; audits: number };
  };
}

const statusColors: Record<string, string> = {
  ACTIVE: "#34d399",
  PAUSED: "#fbbf24",
  COMPLETED: "#818cf8",
  ARCHIVED: "#64748b",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const lastScore = project.audits[0]?.score;
  const lastGrade = lastScore !== undefined ? getGrade(lastScore) : null;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="card-hover group block rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.03]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
            {project.name}
          </h3>
          <p className="mt-1 truncate text-xs text-indigo-400/70">{project.url}</p>
        </div>
        {lastScore !== undefined && lastGrade && (
          <ScoreRing score={lastScore} grade={lastGrade} size={58} />
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <span
          className="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border"
          style={{
            borderColor: `${statusColors[project.status]}30`,
            backgroundColor: `${statusColors[project.status]}12`,
            color: statusColors[project.status],
          }}
        >
          {project.status}
        </span>
        <span className="text-[11px] text-white/30">{project._count.audits} audits</span>
        <span className="text-white/15">·</span>
        <span className="text-[11px] text-white/30">{project._count.tasks} tasks</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {project.members.slice(0, 5).map((m) => (
            <div
              key={m.user.id}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-[#04050b] bg-indigo-500/20 text-[9px] font-bold text-indigo-300"
              title={m.user.name}
            >
              {m.user.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {project.members.length > 5 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#04050b] bg-white/[0.06] text-[9px] text-white/40">
              +{project.members.length - 5}
            </div>
          )}
        </div>
        <span className="text-[10px] text-white/20 group-hover:text-indigo-400/60 transition-colors">View →</span>
      </div>
    </Link>
  );
}
