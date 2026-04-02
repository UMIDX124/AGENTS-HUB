"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { TaskBoard } from "@/components/task-board";
import { ListTodo, Plus, X } from "lucide-react";

export default function TasksPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [tasks, setTasks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  useEffect(() => {
    fetch("/api/tasks").then((r) => r.json()).then((d) => Array.isArray(d) && setTasks(d));
  }, []);

  async function handleStatusChange(taskId: string, newStatus: string) {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, status: newStatus }),
    });
    if (res.ok) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, priority }),
    });
    if (res.ok) {
      const newTask = await res.json();
      setTasks((prev) => [...prev, newTask]);
      setShowForm(false);
      setTitle(""); setDescription(""); setPriority("MEDIUM");
    }
  }

  const todoCount = tasks.filter(t => t.status === "TODO").length;
  const inProgressCount = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const doneCount = tasks.filter(t => t.status === "DONE").length;

  return (
    <div className="min-h-screen">
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="Task Board" subtitle="Kanban" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-white/30" />
              <span className="text-xs text-muted-foreground">{todoCount} Todo</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              <span className="text-xs text-muted-foreground">{inProgressCount} In Progress</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-muted-foreground">{doneCount} Done</span>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> New Task
          </button>
        </div>

        {/* Quick add form */}
        {showForm && (
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Add New Task</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground/70 hover:text-muted-foreground"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={createTask} className="space-y-3">
              <input
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-white placeholder-muted-foreground/50 outline-none focus:border-teal-500/50"
              />
              <input
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-white placeholder-muted-foreground/50 outline-none focus:border-teal-500/50"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-white outline-none focus:border-teal-500/50"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110">
                  Create Task
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-border px-4 py-2 text-sm text-white/50 hover:text-foreground">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {tasks.length > 0 ? (
          <TaskBoard tasks={tasks} onStatusChange={handleStatusChange} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10">
              <ListTodo className="h-8 w-8 text-teal-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No tasks yet</h3>
            <p className="mt-1 text-sm text-muted-foreground/70">Create a task manually or run an audit to auto-generate tasks</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20"
            >
              <Plus className="h-4 w-4" /> Add First Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
