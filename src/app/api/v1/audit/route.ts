import { NextRequest } from "next/server";
import { requireApiKey } from "@/lib/api-key";
import { auditBodySchema } from "@/lib/v1-validation";
import { v1CorsHeaders } from "@/lib/v1-cors";
import { extractCrawlBundle } from "@/lib/v1-signals";
import { runPillarV1 } from "@/lib/v1-runner";
import {
  type Pillar,
  type AuditFinding,
  type AuditResult,
} from "@/lib/v1-translator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FULL_PILLARS: Pillar[] = [
  "on-page",
  "technical",
  "content",
  "off-site",
  "competitor",
];
const TEASER_PILLARS: Pillar[] = ["on-page", "technical", "content"];

function jsonResponse(
  body: unknown,
  status: number,
  extraHeaders: Record<string, string> = {},
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...v1CorsHeaders(),
      ...extraHeaders,
    },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: v1CorsHeaders() });
}

export async function POST(req: NextRequest) {
  // 1. Auth.
  const auth = await requireApiKey(req);
  if (!auth.ok) {
    if (auth.status === 429) {
      return jsonResponse({ error: auth.message, resetAt: auth.resetAt }, 429);
    }
    return jsonResponse({ error: auth.message }, 401);
  }

  // 2. Parse + validate.
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }
  const parsed = auditBodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonResponse(
      { error: "invalid_body", issues: parsed.error.issues },
      400,
    );
  }
  const { url, depth } = parsed.data;

  // 3. Single fetch produces the real signal bundle for every pillar.
  let bundle: Awaited<ReturnType<typeof extractCrawlBundle>>;
  try {
    bundle = await extractCrawlBundle(url);
  } catch (err) {
    return jsonResponse(
      { error: "crawl_failed", message: String((err as Error)?.message ?? err) },
      502,
    );
  }

  const pillarsToRun = depth === "teaser" ? TEASER_PILLARS : FULL_PILLARS;

  // 4. Run pillar explainers in parallel — each one only writes prose
  //    around the pre-measured signals; severity + score are deterministic.
  const settled = await Promise.allSettled(
    pillarsToRun.map((p) => runPillarV1(p, bundle.finalUrl, bundle.signals[p] ?? [])),
  );

  const scores: { pillar: Pillar; value: number }[] = [];
  let findings: AuditFinding[] = [];

  for (let i = 0; i < pillarsToRun.length; i++) {
    const p = pillarsToRun[i];
    const r = settled[i];
    if (r.status === "fulfilled") {
      scores.push({ pillar: p, value: r.value.score });
      findings.push(...r.value.findings);
    } else {
      console.error(`[v1/audit] pillar=${p} failed:`, r.reason);
    }
  }

  // 5. Teaser mode: trim to the most actionable 3 findings per pillar
  //    (pick by severity: critical > warn > win, preserve order within band).
  if (depth === "teaser") {
    const sevRank = { critical: 0, warn: 1, win: 2 } as const;
    const byPillar = new Map<Pillar, AuditFinding[]>();
    for (const f of findings) {
      const arr = byPillar.get(f.pillar) ?? [];
      arr.push(f);
      byPillar.set(f.pillar, arr);
    }
    findings = [];
    for (const p of pillarsToRun) {
      const arr = (byPillar.get(p) ?? [])
        .slice()
        .sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
      findings.push(...arr.slice(0, 3));
    }
  }

  const overall =
    scores.length === 0
      ? 0
      : Math.round(
          scores.reduce((acc, s) => acc + s.value, 0) / scores.length,
        );

  if (scores.length === 0) {
    return jsonResponse({ error: "all_pillars_failed" }, 502);
  }

  const result: AuditResult = {
    url,
    finalUrl: bundle.finalUrl,
    fetchedAt: bundle.fetchedAt,
    overall,
    scores,
    findings,
    source: "agents-hub",
  };

  return jsonResponse(result, 200);
}
