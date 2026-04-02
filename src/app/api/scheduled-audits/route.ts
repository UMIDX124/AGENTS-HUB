import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getNextRun(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case "daily": return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "weekly": return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly": {
      const next = new Date(now);
      next.setMonth(next.getMonth() + 1);
      return next;
    }
    default: return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;

    const schedules = await prisma.scheduledAudit.findMany({
      where: { userId: user.id },
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(schedules);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;

    const { url, agent, frequency, projectId } = await req.json();

    if (!url || !agent) {
      return NextResponse.json({ error: "URL and agent are required" }, { status: 400 });
    }

    const schedule = await prisma.scheduledAudit.create({
      data: {
        url,
        agent,
        frequency: frequency || "weekly",
        nextRun: getNextRun(frequency || "weekly"),
        userId: user.id,
        projectId: projectId || null,
      },
    });

    return NextResponse.json(schedule);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;

    const { id, enabled, frequency } = await req.json();

    const update: any = {};
    if (enabled !== undefined) update.enabled = enabled;
    if (frequency) {
      update.frequency = frequency;
      update.nextRun = getNextRun(frequency);
    }

    const schedule = await prisma.scheduledAudit.updateMany({
      where: { id, userId: user.id },
      data: update,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;

    const { id } = await req.json();
    await prisma.scheduledAudit.deleteMany({ where: { id, userId: user.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
