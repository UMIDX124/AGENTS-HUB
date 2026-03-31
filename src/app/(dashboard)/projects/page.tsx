"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { ProjectCard } from "@/components/project-card";
import { Plus, FolderOpen, Globe, X } from "lucide-react";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/projects").then((r) => r.json()).then((d) => Array.isArray(d) && setProjects(d));
  }, []);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url, description }),
    });
    setLoading(false);
    if (res.ok) {
      setShowForm(false);
      setName(""); setUrl(""); setDescription("");
      fetch("/api/projects").then((r) => r.json()).then((d) => Array.isArray(d) && setProjects(d));
    }
  }

  const canCreate = user?.role === "OWNER" || user?.role === "MANAGER";

  return (
    <div className="min-h-screen">
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="Projects" subtitle="Client Portfolio" />

      <div className="p-6 space-y-6">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">{projects.length} Project{projects.length !== 1 ? "s" : ""}</h2>
            <p className="text-xs text-white/30 mt-0.5">Manage your client websites</p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> New Project
            </button>
          )}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Create New Project</h3>
              <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={createProject} className="space-y-3">
              <input
                placeholder="Project name (e.g. Acme Corp)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50 focus:bg-white/[0.06]"
              />
              <input
                placeholder="Website URL (e.g. https://acme.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50 focus:bg-white/[0.06]"
              />
              <input
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50 focus:bg-white/[0.06]"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create Project"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/50 transition-all hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects grid */}
        {projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p: any) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10">
              <FolderOpen className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-base font-semibold text-white">No projects yet</h3>
            <p className="mt-1 text-sm text-white/30">Create your first client project to start tracking SEO</p>
            {canCreate && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20"
              >
                <Plus className="h-4 w-4" /> Create Project
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
