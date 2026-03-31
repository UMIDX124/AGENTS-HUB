import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runAgent } from "@/lib/agents";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { type AgentTypeName } from "@/types";

const ALL_AGENTS: AgentTypeName[] = [
  "ONPAGE", "TECHNICAL", "OFFSITE", "CONTENT", "COMPETITOR",
];

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

    const { url, projectId } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const results: Record<string, any> = {};
    const audits: any[] = [];

    // Run agents sequentially to avoid rate limits
    for (const agentType of ALL_AGENTS) {
      try {
        const result = await runAgent(agentType, url, user.id);
        const audit = await prisma.audit.create({
          data: {
            url,
            agent: agentType,
            score: result.score,
            grade: result.grade,
            summary: result.summary,
            data: JSON.stringify(result),
            userId: user.id,
            projectId: projectId || null,
          },
        });
        results[agentType] = result;
        audits.push(audit);
      } catch (error: any) {
        results[agentType] = { error: error.message };
      }
    }

    return NextResponse.json({ audits, results });
  } catch (error: any) {
    console.error("Run all agents error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to run agents" },
      { status: 500 }
    );
  }
}
