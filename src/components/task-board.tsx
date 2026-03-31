"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface TaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee?: { id: string; name: string; avatar?: string | null } | null;
  agentSource?: string | null;
  dueDate?: string | null;
  project?: { id: string; name: string } | null;
}

interface TaskBoardProps {
  tasks: TaskItem[];
  onStatusChange: (taskId: string, newStatus: string) => void;
}

const COLUMNS = [
  { key: "TODO",        label: "To Do",      color: "#64748b", dot: "bg-slate-500" },
  { key: "IN_PROGRESS", label: "In Progress", color: "#818cf8", dot: "bg-indigo-400" },
  { key: "IN_REVIEW",   label: "In Review",   color: "#fbbf24", dot: "bg-amber-400" },
  { key: "DONE",        label: "Done",        color: "#34d399", dot: "bg-emerald-400" },
];

const priorityConfig: Record<string, { color: string; label: string }> = {
  CRITICAL: { color: "#f87171", label: "Critical" },
  HIGH:     { color: "#fb923c", label: "High" },
  MEDIUM:   { color: "#fbbf24", label: "Medium" },
  LOW:      { color: "#34d399", label: "Low" },
};

const agentColors: Record<string, string> = {
  ONPAGE:     "#818cf8",
  TECHNICAL:  "#22d3ee",
  OFFSITE:    "#a78bfa",
  CONTENT:    "#34d399",
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.key);
        const isOver = dragOver === col.key;

        return (
          <div
            key={col.key}
            className={cn(
              "flex flex-col rounded-2xl border p-3 transition-all duration-200 min-h-[200px]",
              isOver
                ? "border-white/20 bg-white/[0.04]"
                : "border-white/[0.06] bg-white/[0.02]"
            )}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(col.key)}
          >
            {/* Column header */}
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", col.dot)} />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">
                  {col.label}
                </h3>
              </div>
              <span
                className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                style={{
                  backgroundColor: columnTasks.length > 0 ? `${col.color}20` : "rgba(255,255,255,0.04)",
                  color: columnTasks.length > 0 ? col.color : "rgba(255,255,255,0.2)",
                }}
              >
                {columnTasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="flex-1 space-y-2">
              {columnTasks.map((task) => {
                const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;
                const agentColor = task.agentSource ? agentColors[task.agentSource] : null;

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className={cn(
                      "group cursor-grab rounded-xl border border-white/[0.07] bg-[#07080f] p-3 transition-all duration-200",
                      "hover:border-white/[0.14] hover:bg-white/[0.03] hover:shadow-lg hover:shadow-black/20",
                      "active:cursor-grabbing active:scale-[0.97]",
                      draggedTask === task.id && "opacity-40 scale-95"
                    )}
                  >
                    {/* Priority indicator line */}
                    <div
                      className="mb-2 h-0.5 w-8 rounded-full"
                      style={{ backgroundColor: priority.color }}
                    />

                    <p className="text-xs font-semibold leading-relaxed text-white/80 group-hover:text-white transition-colors">
                      {task.title}
                    </p>

                    {task.project && (
                      <p className="mt-1 truncate text-[10px] text-indigo-400/50">
                        {task.project.name}
                      </p>
                    )}

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide border"
                        style={{
                          borderColor: `${priority.color}30`,
                          backgroundColor: `${priority.color}12`,
                          color: priority.color,
                        }}
                      >
                        {priority.label}
                      </span>
                      {agentColor && task.agentSource && (
                        <span
                          className="rounded-md px-1.5 py-0.5 text-[9px] font-medium border"
                          style={{
                            borderColor: `${agentColor}25`,
                            backgroundColor: `${agentColor}10`,
                            color: agentColor,
                          }}
                        >
                          {task.agentSource}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      {task.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <div
                            className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
                            style={{ backgroundColor: "rgba(129,140,248,0.2)", color: "#818cf8" }}
                          >
                            {task.assignee.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[10px] text-white/30">{task.assignee.name.split(" ")[0]}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-white/15">Unassigned</span>
                      )}
                      {task.dueDate && (
                        <span className="text-[10px] text-white/25">
                          {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Empty drop zone hint */}
              {columnTasks.length === 0 && (
                <div
                  className={cn(
                    "flex h-16 items-center justify-center rounded-xl border border-dashed text-[10px] text-white/15 transition-all",
                    isOver ? "border-white/20 text-white/30 bg-white/[0.02]" : "border-white/[0.06]"
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
