import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/api-auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;

    const keys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, key: true, lastUsed: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    // Mask keys except last 8 chars
    const masked = keys.map((k) => ({
      ...k,
      key: `sah_${"•".repeat(40)}${k.key.slice(-8)}`,
      fullKey: undefined,
    }));

    return NextResponse.json(masked);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;

    if (user.role !== "OWNER" && user.role !== "MANAGER") {
      return NextResponse.json({ error: "Only owners/managers can create API keys" }, { status: 403 });
    }

    const { name } = await req.json();
    const key = generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: { key, name: name || "API Key", userId: user.id },
    });

    // Return full key only on creation
    return NextResponse.json({ id: apiKey.id, key, name: apiKey.name, createdAt: apiKey.createdAt });
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
    await prisma.apiKey.deleteMany({ where: { id, userId: user.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
