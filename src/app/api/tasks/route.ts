import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const assigneeId = searchParams.get("assigneeId");
    const priority = searchParams.get("priority");
    const agentSource = searchParams.get("agentSource");

    const where: any = {};

    if (hasPermission(user.role, "view_all_tasks")) {
      // Can see all tasks
    } else if (hasPermission(user.role, "view_assigned_tasks")) {
      where.assigneeId = user.id;
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (projectId) where.projectId = projectId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (priority) where.priority = priority;
    if (agentSource) where.agentSource = agentSource;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, avatar: true, role: true } },
        creator: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const body = await req.json();

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        status: body.status || "TODO",
        priority: body.priority || "MEDIUM",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        assigneeId: body.assigneeId,
        creatorId: user.id,
        projectId: body.projectId,
        auditId: body.auditId,
        agentSource: body.agentSource,
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Specialists can only update their own tasks
    if (!hasPermission(user.role, "manage_tasks") && task.assigneeId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (data.dueDate) data.dueDate = new Date(data.dueDate);

    const updated = await prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
