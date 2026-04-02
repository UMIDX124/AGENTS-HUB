import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;

    if (!hasPermission(user.role, "view_all_audits")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users with their audit counts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        _count: { select: { audits: true, createdTasks: true } },
      },
    });

    // Get audits per user this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyAudits = await prisma.audit.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: weekAgo } },
      _count: true,
    });

    const weeklyMap = Object.fromEntries(weeklyAudits.map((w) => [w.userId, w._count]));

    const leaderboard = users
      .map((u) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        totalAudits: u._count.audits,
        totalTasks: u._count.createdTasks,
        weeklyAudits: weeklyMap[u.id] || 0,
      }))
      .sort((a, b) => b.totalAudits - a.totalAudits);

    return NextResponse.json(leaderboard);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
