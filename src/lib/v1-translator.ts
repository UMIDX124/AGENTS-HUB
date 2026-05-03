/**
 * v1 contract types — the public shape AGENTS-HUB exposes via /api/v1/audit.
 * Kept in lock-step with /Users/laptopchoice/Projects/crawliq/src/lib/agents-hub-client.ts.
 *
 * This module is types-only now. The honest-pipeline implementation lives in:
 *   - v1-signals.ts  — real measurement extraction (cheerio + headers)
 *   - v1-runner.ts   — LLM as explainer-only over those signals
 *   - app/api/v1/audit/route.ts        — one-shot
 *   - app/api/v1/audit/stream/route.ts — SSE
 *
 * The earlier "translate the existing AgentResult shape" approach was removed
 * because it required deriving placeholder signals from LLM-generated text —
 * that violates the project's hard rule "every finding must cite a real
 * measurement from a named source".
 */

export type Pillar =
  | "on-page"
  | "technical"
  | "content"
  | "off-site"
  | "competitor";

export type AuditSeverity = "critical" | "warn" | "win";

export type AuditSource =
  | "lighthouse"
  | "crux"
  | "search-console"
  | "security-headers"
  | "schema-org"
  | "wayback"
  | "open-pagerank"
  | "cheerio-crawl"
  | "multi-page-crawl";

export type AuditFinding = {
  pillar: Pillar;
  severity: AuditSeverity;
  title: string;
  body: string;
  signal: string;
  source: AuditSource;
};

export type AuditScore = { pillar: Pillar; value: number };

export type AuditResult = {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  overall: number;
  scores: AuditScore[];
  findings: AuditFinding[];
  source: "agents-hub";
};
