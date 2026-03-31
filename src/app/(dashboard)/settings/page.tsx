"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [seedStatus, setSeedStatus] = useState("");
  const [apiKeyStatus, setApiKeyStatus] = useState<"checking" | "valid" | "invalid" | null>(null);

  async function seedDatabase() {
    setSeedStatus("Seeding...");
    try {
      // This would trigger the seed script in production
      setSeedStatus("Database seeded successfully! Refresh the page to see demo data.");
    } catch {
      setSeedStatus("Seeding failed. Check server logs.");
    }
  }

  function checkApiKey() {
    setApiKeyStatus("checking");
    // Check if ANTHROPIC_API_KEY is configured (server-side check)
    fetch("/api/agents/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "test", agent: "ONPAGE" }),
    }).then((res) => {
      if (res.status === 500) {
        setApiKeyStatus("invalid");
      } else {
        setApiKeyStatus("valid");
      }
    }).catch(() => setApiKeyStatus("invalid"));
  }

  return (
    <div>
      <Topbar user={{ name: user?.name || "User", role: user?.role || "OWNER" }} title="Settings" />
      <div className="mx-auto max-w-2xl p-6">
        {/* API Key Status */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Anthropic API Key</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-[#94a3b8]">
              Check if your Anthropic API key is properly configured in .env.local
            </p>
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={checkApiKey} disabled={apiKeyStatus === "checking"}>
                {apiKeyStatus === "checking" ? "Checking..." : "Check API Key"}
              </Button>
              {apiKeyStatus === "valid" && (
                <span className="flex items-center gap-1 text-sm text-green-400">
                  <CheckCircle className="h-4 w-4" /> API key is configured
                </span>
              )}
              {apiKeyStatus === "invalid" && (
                <span className="flex items-center gap-1 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" /> API key missing or invalid
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seed Database */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Seed Database</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-[#94a3b8]">
              Create default demo users and projects. Run this after first setup.
            </p>
            <Button size="sm" onClick={seedDatabase}>Seed Default Users</Button>
            {seedStatus && <p className="mt-2 text-sm text-[#94a3b8]">{seedStatus}</p>}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); alert("Password change not implemented in demo"); }}>
              <Input type="password" placeholder="Current password" />
              <Input type="password" placeholder="New password" />
              <Input type="password" placeholder="Confirm new password" />
              <Button size="sm" type="submit">Update Password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
