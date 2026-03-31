import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { AuditDetailClient } from "./audit-detail-client";

export default async function AuditDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) notFound();

  const audit = await prisma.audit.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  if (!audit) notFound();

  const user = session.user as any;

  return (
    <AuditDetailClient
      user={{ name: user.name || "User", role: user.role }}
      audit={{
        ...audit,
        data: JSON.parse(audit.data),
        createdAt: audit.createdAt.toISOString(),
      }}
    />
  );
}
