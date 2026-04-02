import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const idA = searchParams.get("a");
    const idB = searchParams.get("b");

    if (!idA || !idB) {
      return NextResponse.json({ error: "Two audit IDs required (a, b)" }, { status: 400 });
    }

    const [auditA, auditB] = await Promise.all([
      prisma.audit.findUnique({
        where: { id: idA },
        include: { user: { select: { name: true } }, project: { select: { name: true } } },
      }),
      prisma.audit.findUnique({
        where: { id: idB },
        include: { user: { select: { name: true } }, project: { select: { name: true } } },
      }),
    ]);

    if (!auditA || !auditB) {
      return NextResponse.json({ error: "One or both audits not found" }, { status: 404 });
    }

    return NextResponse.json({ a: auditA, b: auditB });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
