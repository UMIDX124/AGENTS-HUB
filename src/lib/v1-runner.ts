/**
 * v1-runner — runs a single pillar against the v1 contract.
 *
 * Honest pipeline:
 *   1. Real signals are extracted by `extractCrawlBundle` (no LLM involved).
 *   2. We prompt the LLM as an EXPLAINER ONLY: "below are measured signals,
 *      write prose explaining each one. DO NOT invent any signal not on the
 *      list." (This phrasing matches the project memory rule for the audit
 *      pipeline.)
 *   3. Severity is taken from the signal's pre-computed band — never from LLM.
 *   4. Score is a deterministic weighted composite of signal severities.
 *   5. Findings are returned with `signal` + `source` directly from the input
 *      — the LLM only owns the prose `body` (and a refined `title` if it
 *      improves the default).
 */

import { callAI, type AIProvider } from "@/lib/ai-providers";
import type { Pillar, AuditFinding, AuditSeverity } from "@/lib/v1-translator";
import type { Signal } from "@/lib/v1-signals";

export type PillarResult = {
  pillar: Pillar;
  score: number;
  findings: AuditFinding[];
  signalLines: string[]; // raw signal text strings (used by /stream as agent.line events)
};

const SEVERITY_WEIGHT: Record<AuditSeverity, number> = {
  critical: 0,
  warn: 60,
  win: 100,
};

// Map cheerio Signal severity → AuditSeverity (same vocab, just declared
// for type clarity).
function asAuditSeverity(s: Signal["severity"]): AuditSeverity {
  return s;
}

function scoreFromSignals(signals: Signal[]): number {
  if (signals.length === 0) return 0;
  const total = signals.reduce(
    (acc, s) => acc + SEVERITY_WEIGHT[asAuditSeverity(s.severity)],
    0,
  );
  return Math.round(total / signals.length);
}

function buildExplainerPrompt(pillar: Pillar, url: string, signals: Signal[]): string {
  const signalList = signals
    .map(
      (s, i) =>
        `${i + 1}. id=${s.id} | severity=${s.severity} | source=${s.source} | measurement="${s.text}"`,
    )
    .join("\n");
  return [
    `You are an SEO explainer for the CrawlIQ "${pillar}" pillar audit of: ${url}`,
    ``,
    `You will be given a list of REAL signals already measured by our crawler. Your job:`,
    `  - Write a one-paragraph "body" (3-5 sentences) for each signal explaining what it means in plain English and how to fix it if severity is critical or warn.`,
    `  - You may slightly refine the "title" if the default is too generic — but do NOT invent any new fact, number, or citation that is not on the signal list.`,
    `  - DO NOT add findings that are not in the input list.`,
    `  - DO NOT change severity. Severity is set by our code based on numeric thresholds.`,
    ``,
    `Output STRICT JSON only — no markdown fences, no comments. Shape:`,
    `{`,
    `  "findings": [`,
    `    { "id": "<copy id from input>", "title": "<refined or original>", "body": "<3-5 sentences>" }`,
    `  ]`,
    `}`,
    ``,
    `Signals:`,
    signalList,
  ].join("\n");
}

type ExplainerResponse = {
  findings?: { id?: string; title?: string; body?: string }[];
};

function parseLLMJSON(text: string): ExplainerResponse {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return {};
  try {
    return JSON.parse(match[0]);
  } catch {
    return {};
  }
}

export async function runPillarV1(
  pillar: Pillar,
  url: string,
  signals: Signal[],
  provider: AIProvider = "github",
): Promise<PillarResult> {
  if (signals.length === 0) {
    return {
      pillar,
      score: 0,
      findings: [],
      signalLines: [],
    };
  }

  const score = scoreFromSignals(signals);
  const signalLines = signals.map((s) => s.text);

  // Try LLM explainer pass; if it fails, fall back to using the signal's
  // default title as the body. We never throw — the audit always returns.
  let explainer: ExplainerResponse = {};
  try {
    const text = await callAI(
      provider,
      "You are a precise SEO explainer. Output STRICT JSON only.",
      buildExplainerPrompt(pillar, url, signals),
    );
    explainer = parseLLMJSON(text);
  } catch (err) {
    console.warn(`[v1-runner] LLM call failed for pillar=${pillar}:`, err);
  }

  const explainerById = new Map<string, { title?: string; body?: string }>();
  for (const f of explainer.findings || []) {
    if (f && f.id) explainerById.set(f.id, { title: f.title, body: f.body });
  }

  const findings: AuditFinding[] = signals.map((s) => {
    const refined = explainerById.get(s.id);
    return {
      pillar,
      severity: asAuditSeverity(s.severity),
      title: refined?.title?.trim() || s.title,
      body: refined?.body?.trim() || s.title, // safe fallback — never empty
      signal: s.text,
      source: s.source,
    };
  });

  return { pillar, score, findings, signalLines };
}
