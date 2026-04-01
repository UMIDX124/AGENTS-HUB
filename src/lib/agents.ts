import { type AgentTypeName, type AgentConfig, type AgentResult } from "@/types";

export const AGENTS: Record<AgentTypeName, AgentConfig> = {
  ONPAGE: {
    name: "On-Page Audit",
    type: "ONPAGE",
    icon: "\u{1F50D}",
    color: "#818cf8",
    description:
      "Analyzes title tags, meta descriptions, H1-H6 hierarchy, keyword placement, content depth & readability, image alt text, URL structure, internal linking, mobile-friendliness, Open Graph tags.",
  },
  TECHNICAL: {
    name: "Technical SEO",
    type: "TECHNICAL",
    icon: "\u2699\uFE0F",
    color: "#22d3ee",
    description:
      "Analyzes HTTPS/SSL, page speed signals, Core Web Vitals, mobile usability, schema/structured data, sitemap.xml, robots.txt, canonical tags, redirect chains, crawl errors, compression.",
  },
  OFFSITE: {
    name: "Off-Site Authority",
    type: "OFFSITE",
    icon: "\u{1F517}",
    color: "#a78bfa",
    description:
      "Analyzes domain authority signals, backlink profile quality, referring domain diversity, anchor text distribution, brand mentions, social signals, local citations/NAP consistency, toxic link detection.",
  },
  CONTENT: {
    name: "Content Strategy",
    type: "CONTENT",
    icon: "\u{1F4DD}",
    color: "#34d399",
    description:
      "Analyzes content freshness, topic coverage & gaps, E-E-A-T signals, content depth vs competitors, blog activity, media usage, keyword opportunities with difficulty/volume estimates, topic cluster recommendations.",
  },
  COMPETITOR: {
    name: "Competitor Intel",
    type: "COMPETITOR",
    icon: "\u{1F3AF}",
    color: "#fbbf24",
    description:
      "Identifies top 3 real competitors, market position comparison, content gap analysis, backlink gap, keyword overlap, brand strength comparison, growth trends, threat level assessment.",
  },
};

// 3 FREE models — auto-fallback chain
const FREE_MODELS = [
  "nvidia/nemotron-3-super:free",
  "qwen/qwen-3.6-plus-preview:free",
  "openai/gpt-oss-120b:free",
];

function getSystemPrompt(agent: AgentTypeName, url: string): string {
  const config = AGENTS[agent];

  const baseInstruction = `You are an expert SEO analyst performing a ${config.name} audit for the website: ${url}.

Analyze the website based on your knowledge and provide a comprehensive SEO audit. Consider what you know about common SEO patterns, best practices, and typical issues for websites.

${config.description}

You MUST respond with valid JSON only. No markdown, no explanation, no code fences, just the raw JSON object.

The JSON must have this exact structure:
{
  "score": <number 0-100>,
  "grade": "<A+|A|B|C|D|F>",
  "summary": "<2-3 sentence overview>",
  "highlights": [
    { "metric": "<metric name>", "value": "<description>", "status": "<pass|warn|fail>" }
  ],
  "findings": [
    { "title": "<issue title>", "severity": "<critical|warning|good>", "detail": "<actionable fix description>" }
  ],
  "quickWins": ["<action1>", "<action2>", "<action3>"]`;

  if (agent === "CONTENT") {
    return (
      baseInstruction +
      `,
  "keywords": [
    { "keyword": "<keyword>", "volume": <number>, "difficulty": <number 0-100>, "opportunity": "<description>" }
  ],
  "topics": [
    { "topic": "<topic>", "relevance": "<high|medium|low>", "coverage": "<good|partial|missing>" }
  ]
}

Provide at least 5 keywords and 5 topics. Make volume and difficulty realistic estimates.`
    );
  }

  if (agent === "COMPETITOR") {
    return (
      baseInstruction +
      `,
  "competitors": [
    { "name": "<competitor name>", "url": "<competitor url>", "strength": "<description>", "threat": "<high|medium|low>" }
  ]
}

Identify 3-5 real competitors based on the website's niche.`
    );
  }

  return baseInstruction + "\n}\n\nProvide at least 5 highlights and 8 findings with actionable recommendations.";
}

// Simple in-memory rate limiter
const rateLimiter = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const timestamps = rateLimiter.get(userId) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  rateLimiter.set(userId, recent);
  return true;
}

async function callOpenRouter(model: string, systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3011",
      "X-Title": "SEO Agents Hub",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenRouter ${model} failed (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function runAgent(
  agentType: AgentTypeName,
  url: string,
  userId: string
): Promise<AgentResult> {
  if (!checkRateLimit(userId)) {
    throw new Error("Rate limit exceeded. Max 10 requests per minute.");
  }

  const systemPrompt = getSystemPrompt(agentType, url);
  const userMessage = `Perform a comprehensive ${AGENTS[agentType].name} audit for ${url}. Provide detailed, actionable SEO analysis as JSON.`;

  let lastError = "";

  // Try each model in the fallback chain
  for (const model of FREE_MODELS) {
    try {
      console.log(`[Agent] Trying model: ${model} for ${agentType}...`);
      const text = await callOpenRouter(model, systemPrompt, userMessage);

      // Try to parse JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed: AgentResult = JSON.parse(jsonMatch[0]);
      console.log(`[Agent] Success with ${model} — Score: ${parsed.score}`);
      return parsed;
    } catch (err: any) {
      lastError = err.message;
      console.warn(`[Agent] Model ${model} failed: ${err.message}. Trying next...`);
      continue;
    }
  }

  throw new Error(`All models failed. Last error: ${lastError}`);
}
