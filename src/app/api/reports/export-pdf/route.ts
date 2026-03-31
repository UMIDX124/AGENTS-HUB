import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (!hasPermission(user.role, "export_reports")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { auditId } = await req.json();

    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: { user: { select: { name: true } }, project: { select: { name: true } } },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // Return audit data for client-side PDF generation
    return NextResponse.json({
      audit: {
        ...audit,
        data: JSON.parse(audit.data),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
