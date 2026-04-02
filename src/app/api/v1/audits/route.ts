import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const agent = searchParams.get("agent");

    const where: any = {};
    if (user.role !== "OWNER" && user.role !== "MANAGER") where.userId = user.id;
    if (agent) where.agent = agent;

    const [audits, total] = await Promise.all([
      prisma.audit.findMany({
        where,
        select: { id: true, url: true, agent: true, score: true, grade: true, summary: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.audit.count({ where }),
    ]);

    return NextResponse.json({ data: audits, total, limit, offset });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
