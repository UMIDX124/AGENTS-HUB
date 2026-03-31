import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runAgent } from "@/lib/agents";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { type AgentTypeName } from "@/types";

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

    const { url, agent, projectId } = await req.json();

    if (!url || !agent) {
      return NextResponse.json(
        { error: "URL and agent type are required" },
        { status: 400 }
      );
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

    const result = await runAgent(agent, url, user.id);

    const audit = await prisma.audit.create({
      data: {
        url,
        agent,
        score: result.score,
        grade: result.grade,
        summary: result.summary,
        data: JSON.stringify(result),
        userId: user.id,
        projectId: projectId || null,
      },
    });

    return NextResponse.json({ audit, result });
  } catch (error: any) {
    console.error("Agent run error:", error);
    return NextResponse.json(
      { error: error.message || "Agent execution failed" },
      { status: 500 }
    );
  }
}
