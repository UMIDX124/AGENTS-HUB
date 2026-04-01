"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface TaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string | null;
  } | null;
  agentSource?: string | null;
  dueDate?: string | null;
  project?: { id: string; name: string } | null;
}

interface TaskBoardProps {
  tasks: TaskItem[];
  onStatusChange: (taskId: string, newStatus: string) => void;
}

const COLUMNS = [
  { key: "TODO", label: "To Do", color: "#64748b" },
  { key: "IN_PROGRESS", label: "In Progress", color: "#818cf8" },
  { key: "IN_REVIEW", label: "In Review", color: "#fbbf24" },
  { key: "DONE", label: "Done", color: "#34d399" },
];

const priorityVariant: Record<string, "destructive" | "warning" | "secondary" | "success"> = {
  CRITICAL: "destructive",
  HIGH: "warning",
  MEDIUM: "secondary",
  LOW: "success",
};

const agentColors: Record<string, string> = {
  ONPAGE: "#818cf8",
  TECHNICAL: "#22d3ee",
  OFFSITE: "#a78bfa",
  CONTENT: "#34d399",
  COMPETITOR: "#fbbf24",
};

export function TaskBoard({ tasks, onStatusChange }: TaskBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleDragStart = (taskId: string) => setDraggedTask(taskId);
  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    setDragOver(colKey);
  };
  const handleDrop = (status: string) => {
    if (draggedTask) {
      onStatusChange(draggedTask, status);
      setDraggedTask(null);
      setDragOver(null);
    }
  };
  const handleDragLeave = () => setDragOver(null);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.key);
        const isOver = dragOver === col.key;

        return (
          <div
            key={col.key}
            className={cn(
              "flex flex-col rounded-lg border p-3 transition-all duration-200 min-h-[200px]",
              isOver
                ? "border-primary/30 bg-accent/30"
                : "border-border bg-card/50"
            )}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(col.key)}
          >
            {/* Column header */}
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: col.color }}
                />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {col.label}
                </h3>
              </div>
              <Badge
                variant="outline"
                className="h-5 min-w-5 px-1.5 text-[10px] font-bold"
                style={
                  columnTasks.length > 0
                    ? {
                        borderColor: `${col.color}30`,
                        backgroundColor: `${col.color}15`,
                        color: col.color,
                      }
                    : {}
                }
              >
                {columnTasks.length}
              </Badge>
            </div>

            {/* Tasks */}
            <div className="flex-1 space-y-2">
              {columnTasks.map((task) => {
                const agentColor = task.agentSource
                  ? agentColors[task.agentSource]
                  : null;

                return (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className={cn(
                      "group cursor-grab transition-all duration-200",
                      "hover:border-border/80 hover:bg-accent/30 hover:shadow-lg hover:shadow-black/10",
                      "active:cursor-grabbing active:scale-[0.97]",
                      draggedTask === task.id && "opacity-40 scale-95"
                    )}
                  >
                    <CardContent className="p-3">
                      <p className="text-xs font-semibold leading-relaxed text-foreground/80 group-hover:text-foreground transition-colors">
                        {task.title}
                      </p>

                      {task.project && (
                        <p className="mt-1 truncate text-[10px] text-primary/50">
                          {task.project.name}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        <Badge
                          variant={
                            priorityVariant[task.priority] || "secondary"
                          }
                          className="text-[9px] px-1.5 py-0"
                        >
                          {task.priority}
                        </Badge>
                        {agentColor && task.agentSource && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0"
                            style={{
                              borderColor: `${agentColor}30`,
                              color: agentColor,
                            }}
                          >
                            {task.agentSource}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        {task.assignee ? (
                          <div className="flex items-center gap-1.5">
                            <Avatar className="size-5">
                              <AvatarFallback className="bg-primary/15 text-[8px] font-bold text-primary">
                                {task.assignee.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] text-muted-foreground">
                              {task.assignee.name.split(" ")[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/50">
                            Unassigned
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(task.dueDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {columnTasks.length === 0 && (
                <div
                  className={cn(
                    "flex h-16 items-center justify-center rounded-md border border-dashed text-[10px] text-muted-foreground/50 transition-all",
                    isOver && "border-primary/30 text-muted-foreground bg-accent/20"
                  )}
                >
                  {isOver ? "Drop here" : "No tasks"}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
