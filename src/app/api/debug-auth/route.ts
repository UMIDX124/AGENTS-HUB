import { NextRequest, NextResponse } from "next/server";
import { existsSync, statSync, copyFileSync } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const cwd = process.cwd();
    const bundledPath = path.join(cwd, "prisma", "dev.db");
    const tmpPath = "/tmp/dev.db";
    const bundledExists = existsSync(bundledPath);
    const bundledSize = bundledExists ? statSync(bundledPath).size : 0;
    const tmpExistsBefore = existsSync(tmpPath);
    const tmpSizeBefore = tmpExistsBefore ? statSync(tmpPath).size : 0;

    // Force copy if needed
    if (bundledExists && (!tmpExistsBefore || tmpSizeBefore < 1000)) {
      copyFileSync(bundledPath, tmpPath);
    }

    const tmpExistsAfter = existsSync(tmpPath);
    const tmpSizeAfter = tmpExistsAfter ? statSync(tmpPath).size : 0;

    // Now try prisma
    const { prisma } = await import("@/lib/prisma");
    const { compare } = await import("bcryptjs");

    const allUsers = await prisma.user.findMany({ select: { email: true, name: true } });
    const user = await prisma.user.findUnique({ where: { email } });

    let passwordValid = false;
    if (user && password) {
      passwordValid = await compare(password, user.password);
    }

    return NextResponse.json({
      cwd,
      bundledPath,
      bundledExists,
      bundledSize,
      tmpPath,
      tmpExistsBefore,
      tmpSizeBefore,
      tmpExistsAfter,
      tmpSizeAfter,
      totalUsers: allUsers.length,
      allEmails: allUsers.map(u => u.email),
      userFound: !!user,
      passwordValid,
      userName: user?.name || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack?.substring(0, 500) }, { status: 500 });
  }
}
