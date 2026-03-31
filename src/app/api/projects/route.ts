import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    let projects;
    if (hasPermission(user.role, "manage_projects")) {
      projects = await prisma.project.findMany({
        include: {
          members: { include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } } },
          audits: { orderBy: { createdAt: "desc" }, take: 1 },
          _count: { select: { tasks: true, audits: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
    } else {
      projects = await prisma.project.findMany({
        where: { members: { some: { userId: user.id } } },
        include: {
          members: { include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } } },
          audits: { orderBy: { createdAt: "desc" }, take: 1 },
          _count: { select: { tasks: true, audits: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    return NextResponse.json(projects);
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
    if (!hasPermission(user.role, "create_projects")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, url, description, memberIds } = await req.json();

    const project = await prisma.project.create({
      data: {
        name,
        url,
        description,
        members: {
          create: [
            { userId: user.id, role: "owner" },
            ...(memberIds || []).map((id: string) => ({ userId: id, role: "member" })),
          ],
        },
      },
      include: { members: { include: { user: true } } },
    });

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
