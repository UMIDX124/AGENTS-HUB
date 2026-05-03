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

const SSE_HEADERS: Record<string, string> = {
  "content-type": "text/event-stream; charset=utf-8",
  "cache-control": "no-cache, no-transform",
  connection: "keep-alive",
  "x-accel-buffering": "no",
  ...v1CorsHeaders(),
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...v1CorsHeaders(),
    },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: v1CorsHeaders() });
}

function sseChunk(event: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

export async function POST(req: NextRequest) {
  const auth = await requireApiKey(req);
  if (!auth.ok) {
    if (auth.status === 429) {
      return jsonResponse({ error: auth.message, resetAt: auth.resetAt }, 429);
    }
    return jsonResponse({ error: auth.message }, 401);
  }

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
  const pillarsToRun = depth === "teaser" ? TEASER_PILLARS : FULL_PILLARS;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: unknown) => {
        try {
          controller.enqueue(sseChunk(event));
        } catch {
          /* client disconnected */
        }
      };

      try {
        // 1. Real crawl: produces honest signals before any LLM is touched.
        const bundle = await extractCrawlBundle(url);

        const scores: { pillar: Pillar; value: number }[] = [];
        let allFindings: AuditFinding[] = [];

        // 2. Per-pillar runs — emit real signal lines as agent.line events.
        for (const pillar of pillarsToRun) {
          send({ type: "agent.start", pillar });

          const signals = bundle.signals[pillar] ?? [];
          // Real signal lines from the crawl — NOT synthetic mocks.
          for (const sig of signals) {
            send({ type: "agent.line", pillar, text: sig.text });
            await new Promise((r) => setTimeout(r, 60));
          }

          try {
            const r = await runPillarV1(pillar, bundle.finalUrl, signals);
            scores.push({ pillar, value: r.score });
            send({ type: "agent.score", pillar, value: r.score });

            // Sort findings by severity (critical first) when teaser.
            let pillarFindings = r.findings;
            if (depth === "teaser") {
              const sevRank = { critical: 0, warn: 1, win: 2 } as const;
              pillarFindings = pillarFindings
                .slice()
                .sort((a, b) => sevRank[a.severity] - sevRank[b.severity])
                .slice(0, 3);
            }
            for (const f of pillarFindings) send({ type: "finding", finding: f });
            allFindings.push(...pillarFindings);
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "pillar_failed";
            send({ type: "agent.line", pillar, text: `error: ${message}` });
          }
        }

        if (scores.length === 0) {
          send({ type: "error", message: "all_pillars_failed" });
        } else {
          const overall = Math.round(
            scores.reduce((acc, s) => acc + s.value, 0) / scores.length,
          );
          const result: AuditResult = {
            url,
            finalUrl: bundle.finalUrl,
            fetchedAt: bundle.fetchedAt,
            overall,
            scores,
            findings: allFindings,
            source: "agents-hub",
          };
          send({ type: "complete", result });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "stream_failed";
        send({ type: "error", message });
      } finally {
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
  });

  return new Response(stream, { status: 200, headers: SSE_HEADERS });
}
