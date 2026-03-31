"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/projects").then((r) => r.json()).then(setProjects);
  }, []);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url, description }),
    });
    if (res.ok) {
      setShowForm(false);
      setName(""); setUrl(""); setDescription("");
      fetch("/api/projects").then((r) => r.json()).then(setProjects);
    }
  }

  return (
    <div>
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="Projects" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Projects</h2>
          {(user?.role === "OWNER" || user?.role === "MANAGER") && (
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          )}
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-base">Create New Project</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={createProject} className="space-y-3">
                <Input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input placeholder="Website URL" value={url} onChange={(e) => setUrl(e.target.value)} required />
                <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
                <div className="flex gap-2">
                  <Button type="submit" size="sm">Create</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p: any) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>

        {projects.length === 0 && (
          <p className="mt-8 text-center text-sm text-[#64748b]">No projects yet. Create your first project to get started.</p>
        )}
      </div>
    </div>
  );
}
