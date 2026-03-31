import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  const user = session!.user as any;

  const [totalAudits, recentAudits, projects, pendingTasks] = await Promise.all([
    prisma.audit.count(
      user.role === "CLIENT" ? { where: { userId: user.id } } : undefined
    ),
    prisma.audit.findMany({
      where: user.role === "CLIENT" ? { userId: user.id } : {},
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true } }, project: { select: { name: true } } },
    }),
    prisma.project.count(),
    prisma.task.count({ where: { status: { in: ["TODO", "IN_PROGRESS"] } } }),
  ]);

  const avgScore = recentAudits.length
    ? Math.round(recentAudits.reduce((sum, a) => sum + a.score, 0) / recentAudits.length)
    : 0;

  const chartData = recentAudits
    .map((a) => ({ date: a.createdAt.toISOString(), score: a.score, agent: a.agent }))
    .reverse();

  return (
    <DashboardClient
      user={{ name: user.name || "User", role: user.role }}
      stats={{ totalAudits, avgScore, projects, pendingTasks }}
      recentAudits={recentAudits.map((a) => ({
        id: a.id,
        url: a.url,
        agent: a.agent,
        score: a.score,
        grade: a.grade,
        createdAt: a.createdAt.toISOString(),
        userName: a.user.name,
        projectName: a.project?.name || null,
      }))}
      chartData={chartData}
    />
  );
}
