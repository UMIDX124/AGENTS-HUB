import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { ProjectDetailClient } from "./project-detail-client";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) notFound();

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      audits: { orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } },
      tasks: {
        include: { assignee: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) notFound();
  const user = session.user as any;

  const chartData = project.audits.map((a) => ({
    date: a.createdAt.toISOString(),
    score: a.score,
    agent: a.agent,
  })).reverse();

  return (
    <ProjectDetailClient
      user={{ name: user.name || "User", role: user.role }}
      project={{
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        audits: project.audits.map((a) => ({
          ...a,
          data: a.data,
          createdAt: a.createdAt.toISOString(),
        })),
        tasks: project.tasks.map((t) => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          dueDate: t.dueDate?.toISOString() || null,
        })),
      }}
      chartData={chartData}
    />
  );
}
