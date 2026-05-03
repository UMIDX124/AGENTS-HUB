-- One-shot fix: the existing ApiKey table on the prod DB has stale columns.
-- Drop it and recreate with the correct schema. Safe because the table is
-- empty (no keys minted yet).

DROP TABLE IF EXISTS "ApiKey" CASCADE;

CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "hashedKey" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "rateLimit" INTEGER NOT NULL DEFAULT 60,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ApiKey_hashedKey_key" ON "ApiKey"("hashedKey");
CREATE INDEX "ApiKey_prefix_idx" ON "ApiKey"("prefix");
