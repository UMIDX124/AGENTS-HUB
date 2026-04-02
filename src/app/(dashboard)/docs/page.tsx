"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { Code, Key, Copy, Check, Plus, Trash2, FileText, FolderOpen, Zap } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function DocsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [keys, setKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/v1/keys").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setKeys(data);
    });
  }, []);

  async function createKey() {
    const res = await fetch("/api/v1/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName || "API Key" }),
    });
    const data = await res.json();
    if (data.key) {
      setCreatedKey(data.key);
      setNewKeyName("");
      fetch("/api/v1/keys").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setKeys(d); });
    }
  }

  async function deleteKey(id: string) {
    await fetch("/api/v1/keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  function copyKey() {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const baseUrl = "https://agents-hub-fawn.vercel.app";

  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/audits",
      desc: "List all audits",
      params: "limit (max 100), offset, agent (ONPAGE|TECHNICAL|OFFSITE|CONTENT|COMPETITOR)",
      example: `curl -H "Authorization: Bearer sah_your_key" ${baseUrl}/api/v1/audits?limit=10`,
    },
    {
      method: "GET",
      path: "/api/v1/projects",
      desc: "List all projects",
      params: "None",
      example: `curl -H "Authorization: Bearer sah_your_key" ${baseUrl}/api/v1/projects`,
    },
  ];

  return (
    <div className="min-h-screen">
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="API" subtitle="Developer Documentation" />

      <div className="p-4 sm:p-6 space-y-5 max-w-3xl">
        {/* API Keys Management */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
              <Key className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">API Keys</h2>
              <p className="text-xs text-muted-foreground">Create and manage API keys for programmatic access</p>
            </div>
          </div>

          {/* Created key alert */}
          {createdKey && (
            <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-xs text-emerald-400 font-semibold mb-2">New API key created — copy it now, it will not be shown again:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-background/50 px-3 py-2 text-xs font-mono text-foreground break-all">{createdKey}</code>
                <button onClick={copyKey} className="flex items-center gap-1 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {/* Create new key */}
          {(user?.role === "OWNER" || user?.role === "MANAGER") && (
            <div className="flex gap-2 mb-4">
              <input
                placeholder="Key name (e.g. Production)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-muted/60 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-teal-500/50"
              />
              <button onClick={createKey} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2.5 text-xs font-semibold text-white hover:brightness-110">
                <Plus className="h-3.5 w-3.5" /> Create Key
              </button>
            </div>
          )}

          {/* Existing keys */}
          {keys.length > 0 ? (
            <div className="space-y-2">
              {keys.map((k) => (
                <div key={k.id} className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{k.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{k.key}</p>
                  </div>
                  <button onClick={() => deleteKey(k.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No API keys yet</p>
          )}
        </div>

        {/* API Reference */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15">
              <Code className="h-4 w-4 text-teal-400" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">API Reference (v1)</h2>
          </div>

          <div className="mb-4 rounded-xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Authentication</p>
            <p className="text-sm text-foreground/80">Include your API key in the Authorization header:</p>
            <code className="mt-2 block rounded-lg bg-background/50 px-3 py-2 text-xs font-mono text-foreground">
              Authorization: Bearer sah_your_api_key_here
            </code>
          </div>

          <div className="space-y-4">
            {endpoints.map((ep) => (
              <div key={ep.path} className="rounded-xl border border-border/70 bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">{ep.method}</span>
                  <code className="text-sm font-mono text-foreground">{ep.path}</code>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{ep.desc}</p>
                {ep.params !== "None" && (
                  <p className="text-xs text-muted-foreground mb-2"><strong>Params:</strong> {ep.params}</p>
                )}
                <div className="mt-2">
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Example</p>
                  <code className="block rounded-lg bg-background/50 px-3 py-2 text-[11px] font-mono text-foreground/70 break-all">
                    {ep.example}
                  </code>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Response Format</p>
            <code className="block rounded-lg bg-background/50 px-3 py-2 text-[11px] font-mono text-foreground/70 whitespace-pre">
{`{
  "data": [...],
  "total": 42,
  "limit": 20,
  "offset": 0
}`}
            </code>
          </div>

          <div className="mt-4 rounded-xl border border-amber-500/10 bg-amber-500/5 p-4">
            <p className="text-xs text-amber-400"><strong>Rate Limit:</strong> 60 requests/minute per API key. Exceeding returns 429 Too Many Requests.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
