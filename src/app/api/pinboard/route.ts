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
    if (!hasPermission(user.role, "use_pinboard")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pins = await prisma.pin.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pins);
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
    if (!hasPermission(user.role, "use_pinboard")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, detail, agent, severity, impact } = await req.json();

    const pin = await prisma.pin.create({
      data: {
        title,
        detail,
        agent,
        severity,
        impact,
        userId: user.id,
      },
    });

    return NextResponse.json(pin);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { pinId } = await req.json();

    const pin = await prisma.pin.findUnique({ where: { id: pinId } });
    if (!pin || pin.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.pin.delete({ where: { id: pinId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
