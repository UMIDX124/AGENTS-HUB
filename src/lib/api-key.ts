import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * API key auth + rate limiting for /api/v1/* routes.
 *
 * Two-key model (per AGENTS_HUB_INTEGRATION.md):
 *  - x-api-key       (required) — public, rate-limited per key
 *  - x-internal-key  (optional) — server-to-server, bypasses public rate limits
 */

export type ApiKeyAuthOk = {
  ok: true;
  scope: "public" | "internal";
  keyId: string;
};

export type ApiKeyAuthErr = {
  ok: false;
  status: 401 | 429;
  message: string;
  resetAt?: string;
};

export type ApiKeyAuthResult = ApiKeyAuthOk | ApiKeyAuthErr;

export function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

// In-memory rate limiter — Map<keyId, sorted timestamp[] within last hour>
const usageWindow = new Map<string, number[]>();
const HOUR_MS = 60 * 60 * 1000;

export function checkRateLimit(keyId: string, limitPerHour: number): boolean {
  const now = Date.now();
  const arr = usageWindow.get(keyId) || [];
  const recent = arr.filter((t) => now - t < HOUR_MS);
  if (recent.length >= limitPerHour) {
    usageWindow.set(keyId, recent);
    return false;
  }
  recent.push(now);
  usageWindow.set(keyId, recent);
  return true;
}

function rateLimitResetAt(keyId: string): string {
  const arr = usageWindow.get(keyId) || [];
  if (arr.length === 0) return new Date(Date.now() + HOUR_MS).toISOString();
  const oldest = Math.min(...arr);
  return new Date(oldest + HOUR_MS).toISOString();
}

function touchKeyAsync(id: string): void {
  // fire-and-forget; never block response
  prisma.apiKey
    .update({ where: { id }, data: { lastUsedAt: new Date() } })
    .catch((e: unknown) => {
      console.error("[api-key] failed to update lastUsedAt:", e);
    });
}

export async function requireApiKey(req: Request): Promise<ApiKeyAuthResult> {
  const publicKey = req.headers.get("x-api-key");
  const internalKey = req.headers.get("x-internal-key");

  if (!publicKey) {
    return { ok: false, status: 401, message: "unauthorized" };
  }

  // 1. If x-internal-key is provided, verify it against an "internal"-scoped key.
  if (internalKey) {
    const hashed = hashKey(internalKey);
    const row = await prisma.apiKey.findUnique({ where: { hashedKey: hashed } });
    if (row && row.active && row.scope === "internal") {
      touchKeyAsync(row.id);
      return { ok: true, scope: "internal", keyId: row.id };
    }
    // fall through — invalid internal key → require valid public key instead
  }

  // 2. Validate x-api-key as a "public"-scoped key.
  const hashedPub = hashKey(publicKey);
  const pubRow = await prisma.apiKey.findUnique({
    where: { hashedKey: hashedPub },
  });
  if (!pubRow || !pubRow.active || pubRow.scope !== "public") {
    return { ok: false, status: 401, message: "unauthorized" };
  }

  if (!checkRateLimit(pubRow.id, pubRow.rateLimit)) {
    return {
      ok: false,
      status: 429,
      message: "rate_limited",
      resetAt: rateLimitResetAt(pubRow.id),
    };
  }

  touchKeyAsync(pubRow.id);
  return { ok: true, scope: "public", keyId: pubRow.id };
}
