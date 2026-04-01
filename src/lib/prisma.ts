import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync } from "fs";
import path from "path";

function getDatabaseUrl(): string {
  // On Vercel: copy bundled SQLite DB to /tmp (only writable location)
  if (process.env.VERCEL) {
    const tmpDb = "/tmp/dev.db";
    if (!existsSync(tmpDb)) {
      const bundledDb = path.join(process.cwd(), "prisma", "dev.db");
      if (existsSync(bundledDb)) {
        copyFileSync(bundledDb, tmpDb);
      }
    }
    return `file:${tmpDb}`;
  }
  return process.env.DATABASE_URL || "file:./prisma/dev.db";
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: { db: { url: getDatabaseUrl() } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
