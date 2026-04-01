import { NextResponse } from "next/server";
import { existsSync } from "fs";
import path from "path";

export async function GET() {
  const cwd = process.cwd();
  const bundledPath = path.join(cwd, "prisma", "dev.db");
  const bundledExists = existsSync(bundledPath);
  const tmpPath = "/tmp/dev.db";
  const tmpExists = existsSync(tmpPath);

  let userCount = 0;
  let dbError = "";

  try {
    const { prisma } = await import("@/lib/prisma");
    userCount = await prisma.user.count();
  } catch (err: any) {
    dbError = err.message;
  }

  return NextResponse.json({
    cwd,
    isVercel: !!process.env.VERCEL,
    bundledPath,
    bundledExists,
    tmpPath,
    tmpExists,
    userCount,
    dbError,
    envKeys: Object.keys(process.env).filter(k =>
      k.includes("DATABASE") || k.includes("NEXTAUTH") || k.includes("OPENROUTER") || k.includes("VERCEL")
    ),
  });
}
