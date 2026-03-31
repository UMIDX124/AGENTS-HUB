"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Trash2, Pin } from "lucide-react";

const severityColors: Record<string, string> = {
  critical: "#f87171",
  warning: "#fbbf24",
  good: "#34d399",
};

const agentColors: Record<string, string> = {
  ONPAGE: "#818cf8",
  TECHNICAL: "#22d3ee",
  OFFSITE: "#a78bfa",
  CONTENT: "#34d399",
  COMPETITOR: "#fbbf24",
};

export default function PinboardPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [pins, setPins] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/pinboard").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setPins(data);
    });
  }, []);

  async function removePin(pinId: string) {
    await fetch("/api/pinboard", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinId }),
    });
    setPins((prev) => prev.filter((p) => p.id !== pinId));
  }

  return (
    <div>
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="Pinboard" />
      <div className="p-6">
        {pins.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-3 text-[#64748b]">
            <Pin className="h-12 w-12" />
            <p className="text-sm">No pinned findings yet. Pin findings from audit results.</p>
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {pins.map((pin) => (
              <div
                key={pin.id}
                className="mb-4 break-inside-avoid rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className="rounded px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${agentColors[pin.agent] || "#94a3b8"}15`,
                      color: agentColors[pin.agent] || "#94a3b8",
                    }}
                  >
                    {pin.agent}
                  </span>
                  <button
                    onClick={() => removePin(pin.id)}
                    className="rounded p-1 text-[#64748b] hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="text-sm font-medium">{pin.title}</h3>
                <p className="mt-1 text-xs text-[#94a3b8]">{pin.detail}</p>
                <div className="mt-3 flex items-center justify-between">
                  {pin.severity && (
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: `${severityColors[pin.severity] || "#94a3b8"}15`,
                        color: severityColors[pin.severity] || "#94a3b8",
                      }}
                    >
                      {pin.severity}
                    </span>
                  )}
                  <span className="text-[10px] text-[#475569]">{formatDate(pin.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
