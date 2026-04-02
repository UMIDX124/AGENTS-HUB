import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(req.url);
    const agent = searchParams.get("agent");
    const projectId = searchParams.get("projectId");
    const minScore = searchParams.get("minScore");
    const maxScore = searchParams.get("maxScore");

    const where: any = {};

    if (hasPermission(user.role, "view_all_audits")) {
      // Can see all
    } else if (hasPermission(user.role, "view_own_audits")) {
      where.userId = user.id;
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (agent) where.agent = agent;
    if (projectId) where.projectId = projectId;
    if (minScore || maxScore) {
      where.score = {};
      if (minScore) where.score.gte = parseInt(minScore);
      if (maxScore) where.score.lte = parseInt(maxScore);
    }

    const audits = await prisma.audit.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(audits);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { auditId } = await req.json();

    if (!auditId) {
      return NextResponse.json({ error: "auditId required" }, { status: 400 });
    }

    // Only OWNER can delete, or user can delete their own
    const audit = await prisma.audit.findUnique({ where: { id: auditId } });
    if (!audit) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (user.role !== "OWNER" && audit.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete related tasks first
    await prisma.task.deleteMany({ where: { auditId } });
    await prisma.audit.delete({ where: { id: auditId } });

    logActivity(user.id, "audit_deleted", `Deleted audit for ${audit.url} (${audit.agent})`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
