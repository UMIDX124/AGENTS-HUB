/**
 * Generate a new AGENTS-HUB API key and persist its hash.
 *
 * Usage:
 *   pnpm tsx scripts/generate-api-key.ts \
 *     --label="crawliq-prod" \
 *     --scope="public" \
 *     --rateLimit=60
 *
 * The plaintext key is printed exactly ONCE to stdout. Copy it immediately;
 * only the SHA-256 hash is stored in the database.
 */

import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

type Args = {
  label: string;
  scope: "public" | "internal";
  rateLimit: number;
};

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> = { rateLimit: 60 };
  for (const arg of argv.slice(2)) {
    const m = arg.match(/^--([a-zA-Z0-9_-]+)=(.*)$/);
    if (!m) continue;
    const [, k, v] = m;
    if (k === "label") out.label = v;
    else if (k === "scope") {
      if (v !== "public" && v !== "internal") {
        throw new Error(`--scope must be "public" or "internal" (got "${v}")`);
      }
      out.scope = v;
    } else if (k === "rateLimit") {
      const n = Number.parseInt(v, 10);
      if (!Number.isFinite(n) || n <= 0) {
        throw new Error(`--rateLimit must be a positive integer (got "${v}")`);
      }
      out.rateLimit = n;
    }
  }
  if (!out.label) throw new Error("--label is required");
  if (!out.scope) throw new Error("--scope is required (public | internal)");
  return out as Args;
}

function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

async function main() {
  const args = parseArgs(process.argv);
  const prefix = args.scope === "internal" ? "chk_int_" : "chk_pub_";
  const random = crypto.randomBytes(32).toString("base64url");
  const plaintext = `${prefix}${random}`;
  const hashed = hashKey(plaintext);
  const displayPrefix = plaintext.slice(0, 8);

  const prisma = new PrismaClient();
  try {
    const row = await prisma.apiKey.create({
      data: {
        hashedKey: hashed,
        prefix: displayPrefix,
        label: args.label,
        scope: args.scope,
        rateLimit: args.rateLimit,
        active: true,
      },
    });

    process.stdout.write("\n");
    process.stdout.write("=== AGENTS-HUB API key created ===\n");
    process.stdout.write(`id:        ${row.id}\n`);
    process.stdout.write(`label:     ${row.label}\n`);
    process.stdout.write(`scope:     ${row.scope}\n`);
    process.stdout.write(`rateLimit: ${row.rateLimit} req/hour\n`);
    process.stdout.write(`prefix:    ${row.prefix}\n`);
    process.stdout.write("\n");
    process.stdout.write("Plaintext key (shown ONCE — copy it now):\n");
    process.stdout.write(`  ${plaintext}\n`);
    process.stdout.write("\n");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[generate-api-key] failed:", err);
  process.exit(1);
});
