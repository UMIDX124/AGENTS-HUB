import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runAgent } from "@/lib/agents";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { type AgentTypeName } from "@/types";

const ALL_AGENTS: AgentTypeName[] = ["ONPAGE", "TECHNICAL", "OFFSITE", "CONTENT", "COMPETITOR"];

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

    const { projectId, agents } = await req.json();

    // Get all active projects, or a specific one
    const projects = projectId
      ? await prisma.project.findMany({ where: { id: projectId, status: "ACTIVE" } })
      : await prisma.project.findMany({ where: { status: "ACTIVE" } });

    if (projects.length === 0) {
      return NextResponse.json({ error: "No active projects found" }, { status: 400 });
    }

    const agentsToRun: AgentTypeName[] = agents?.length ? agents : ALL_AGENTS;
    const results: any[] = [];
    const errors: any[] = [];

    for (const project of projects) {
      for (const agent of agentsToRun) {
        try {
          const result = await runAgent(agent, project.url, user.id);
          const audit = await prisma.audit.create({
            data: {
              url: project.url,
              agent,
              score: result.score,
              grade: result.grade,
              summary: result.summary,
              data: JSON.stringify(result),
              userId: user.id,
              projectId: project.id,
            },
          });
          results.push({ projectId: project.id, projectName: project.name, agent, score: result.score, grade: result.grade });
        } catch (err: any) {
          errors.push({ projectId: project.id, projectName: project.name, agent, error: err.message });
        }
      }
    }

    return NextResponse.json({
      completed: results.length,
      failed: errors.length,
      results,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Auto-run error:", error);
    return NextResponse.json({ error: error.message || "Auto-run failed" }, { status: 500 });
  }
}
