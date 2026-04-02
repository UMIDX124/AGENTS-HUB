import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { generateSecret, generateURI, verifySync } from "otplib";
import * as qrcode from "qrcode";

// GET: Check 2FA status and generate setup QR if not enabled
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;

    const existing = await prisma.twoFactorSecret.findUnique({ where: { userId: user.id } });

    if (existing?.enabled) {
      return NextResponse.json({ enabled: true });
    }

    // Generate new secret
    const secret = generateSecret();
    const otpauthUrl = generateURI({ issuer: "SEO Agents Hub", label: user.email, secret });

    const qrDataUrl = await qrcode.toDataURL(otpauthUrl);

    // Store secret (not yet enabled)
    await prisma.twoFactorSecret.upsert({
      where: { userId: user.id },
      update: { secret, enabled: false },
      create: { secret, userId: user.id, enabled: false },
    });

    return NextResponse.json({ enabled: false, qrCode: qrDataUrl, secret });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Verify token and enable 2FA
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;

    const { token, action } = await req.json();

    const record = await prisma.twoFactorSecret.findUnique({ where: { userId: user.id } });
    if (!record) return NextResponse.json({ error: "Setup 2FA first" }, { status: 400 });

    if (action === "disable") {
      const isValid = verifySync({ token, secret: record.secret });
      if (!isValid) return NextResponse.json({ error: "Invalid token" }, { status: 400 });

      await prisma.twoFactorSecret.update({ where: { userId: user.id }, data: { enabled: false } });
      return NextResponse.json({ enabled: false });
    }

    // Enable 2FA
    const isValid = verifySync({ token, secret: record.secret });
    if (!isValid) return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });

    await prisma.twoFactorSecret.update({ where: { userId: user.id }, data: { enabled: true } });
    return NextResponse.json({ enabled: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
