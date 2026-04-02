import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { callAI } from "@/lib/ai-providers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { type, data, provider } = await req.json();

    if (type === "fix-suggestion") {
      // #48: Generate fix suggestions for a finding
      const { title, detail, severity } = data;
      const prompt = `Given this SEO finding:
Title: ${title}
Severity: ${severity}
Detail: ${detail}

Provide a concise fix in this exact JSON format:
{"fix": "step-by-step fix instructions (2-3 sentences)", "code": "code snippet if applicable (HTML/meta tag/etc), or empty string", "priority": "immediate|this-week|next-sprint", "effort": "5min|30min|1hr|4hr+"}`;

      const response = await callAI(provider || "gemini",
        "You are an SEO expert. Return ONLY valid JSON, no markdown.",
        prompt
      );

      try {
        const parsed = JSON.parse(response.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
        return NextResponse.json(parsed);
      } catch {
        return NextResponse.json({ fix: response, code: "", priority: "this-week", effort: "30min" });
      }
    }

    if (type === "categorize") {
      // #49: Auto-categorize findings by type
      const { findings } = data;
      const findingsList = findings.map((f: any) => `- [${f.severity}] ${f.title}`).join("\n");
      const prompt = `Categorize these SEO findings into groups. Return JSON:
{"categories": [{"name": "category name", "findings": ["finding title 1", "finding title 2"], "priority": "high|medium|low"}]}

Findings:
${findingsList}`;

      const response = await callAI(provider || "gemini",
        "You are an SEO expert. Return ONLY valid JSON.",
        prompt
      );

      try {
        const parsed = JSON.parse(response.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
        return NextResponse.json(parsed);
      } catch {
        return NextResponse.json({ categories: [] });
      }
    }

    if (type === "compare-summary") {
      // #50: AI summary of audit comparison
      const { auditA, auditB } = data;
      const prompt = `Compare these two SEO audits and give a brief summary:

BEFORE: ${auditA.agent} audit of ${auditA.url} — Score ${auditA.score}/100
Summary: ${auditA.summary}

AFTER: ${auditB.agent} audit of ${auditB.url} — Score ${auditB.score}/100
Summary: ${auditB.summary}

Score change: ${auditB.score - auditA.score} points

Write a 2-3 sentence comparison highlighting what improved, what got worse, and one key recommendation.`;

      const response = await callAI(provider || "gemini",
        "You are an SEO analyst. Be concise and data-driven.",
        prompt
      );

      return NextResponse.json({ summary: response });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
