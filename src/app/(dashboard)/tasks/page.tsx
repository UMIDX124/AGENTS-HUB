"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { TaskBoard } from "@/components/task-board";

export default function TasksPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/tasks").then((r) => r.json()).then(setTasks);
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

  return (
    <div>
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="Task Board" />
      <div className="p-6">
        <TaskBoard tasks={tasks} onStatusChange={handleStatusChange} />
        {tasks.length === 0 && (
          <p className="mt-8 text-center text-sm text-[#64748b]">No tasks yet. Run an audit and create tasks from findings.</p>
        )}
      </div>
    </div>
  );
}
