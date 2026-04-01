"use client";

import Link from "next/link";
import { ScoreRing } from "./score-ring";
import { getGrade } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    url: string;
    status: string;
    members: {
      user: { id: string; name: string; avatar?: string | null };
    }[];
    audits: { score: number }[];
    _count: { tasks: number; audits: number };
  };
}

const statusVariant: Record<string, "default" | "warning" | "secondary" | "outline"> = {
  ACTIVE: "default",
  PAUSED: "warning",
  COMPLETED: "secondary",
  ARCHIVED: "outline",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const lastScore = project.audits[0]?.score;
  const lastGrade = lastScore !== undefined ? getGrade(lastScore) : null;

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="card-hover group transition-colors hover:bg-accent/20">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="mt-1 truncate text-xs text-primary/60">
                {project.url}
              </p>
            </div>
            {lastScore !== undefined && lastGrade && (
              <ScoreRing score={lastScore} grade={lastGrade} size={58} />
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <Badge variant={statusVariant[project.status] || "secondary"}>
              {project.status}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              {project._count.audits} audits
            </span>
            <span className="text-muted-foreground/30">&middot;</span>
            <span className="text-[11px] text-muted-foreground">
              {project._count.tasks} tasks
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex -space-x-1.5">
              {project.members.slice(0, 5).map((m) => (
                <Avatar key={m.user.id} className="size-6 border-2 border-card">
                  <AvatarFallback className="bg-primary/15 text-[9px] font-bold text-primary">
                    {m.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.members.length > 5 && (
                <Avatar className="size-6 border-2 border-card">
                  <AvatarFallback className="bg-muted text-[9px] text-muted-foreground">
                    +{project.members.length - 5}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground group-hover:text-primary/60 transition-colors">
              View &rarr;
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
