import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runAgent } from "@/lib/agents";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { type AgentTypeName } from "@/types";
import { logActivity } from "@/lib/activity";
import { sendAuditCompleteEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (!hasPermission(user.role, "run_agents")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { url, agent, projectId, provider } = await req.json();

    if (!url || !agent) {
      return NextResponse.json(
        { error: "URL and agent type are required" },
        { status: 400 }
      );
    }

    // Auto-add https://
    let validUrl = url.trim();
    if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
      validUrl = "https://" + validUrl;
    }

    const validAgents: AgentTypeName[] = [
      "ONPAGE", "TECHNICAL", "OFFSITE", "CONTENT", "COMPETITOR",
    ];
    if (!validAgents.includes(agent)) {
      return NextResponse.json(
        { error: "Invalid agent type" },
        { status: 400 }
      );
    }

    const result = await runAgent(agent, validUrl, user.id, provider || "github");

    const audit = await prisma.audit.create({
      data: {
        url: validUrl,
        agent,
        score: result.score,
        grade: result.grade,
        summary: result.summary,
        data: JSON.stringify(result),
        userId: user.id,
        projectId: projectId || null,
      },
    });

    logActivity(user.id, "audit_run", `${agent} audit on ${validUrl} — Score: ${result.score}`, { auditId: audit.id, agent, url: validUrl });

    // Send email notification (fire and forget)
    if (user.email) {
      sendAuditCompleteEmail(user.email, user.name || "User", validUrl, agent, result.score, result.grade);
    }

    return NextResponse.json({ audit, result });
  } catch (error: any) {
    console.error("Agent run error:", error);
    return NextResponse.json(
      { error: error.message || "Agent execution failed" },
      { status: 500 }
    );
  }
}
