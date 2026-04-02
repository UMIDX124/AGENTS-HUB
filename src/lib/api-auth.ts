import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export function generateApiKey(): string {
  return `sah_${crypto.randomBytes(24).toString("hex")}`;
}

export async function validateApiKey(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const key = authHeader.slice(7);
  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

  if (!apiKey) return null;

  // Update last used
  prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsed: new Date() } }).catch(() => {});

  return apiKey.user;
}
