import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

    const projects = await prisma.project.findMany({
      select: { id: true, name: true, url: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
