import Anthropic from "@anthropic-ai/sdk";
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

function getSystemPrompt(agent: AgentTypeName, url: string): string {
  const config = AGENTS[agent];

  const baseInstruction = `You are an expert SEO analyst performing a ${config.name} audit for the website: ${url}.

Use your web_search tool to gather real data about this website. Search for the site, check its properties, find information about its SEO performance, backlinks, competitors, and any other relevant data.

${config.description}

You MUST respond with valid JSON only. No markdown, no explanation, just the JSON object.

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
}`
    );
  }

  if (agent === "COMPETITOR") {
    return (
      baseInstruction +
      `,
  "competitors": [
    { "name": "<competitor name>", "url": "<competitor url>", "strength": "<description>", "threat": "<high|medium|low>" }
  ]
}`
    );
  }

  return baseInstruction + "\n}";
}

// Simple in-memory rate limiter
const rateLimiter = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
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

export async function runAgent(
  agentType: AgentTypeName,
  url: string,
  userId: string
): Promise<AgentResult> {
  if (!checkRateLimit(userId)) {
    throw new Error("Rate limit exceeded. Max 10 requests per minute.");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const systemPrompt = getSystemPrompt(agentType, url);

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
        } as any,
      ],
      messages: [
        {
          role: "user",
          content: `Perform a comprehensive ${AGENTS[agentType].name} audit for ${url}. Use web search to gather real data about this website, then provide your analysis as the specified JSON format.`,
        },
      ],
    });

    // Extract text from response
    let text = "";
    for (const block of response.content) {
      if (block.type === "text") {
        text += block.text;
      }
    }

    // Try to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in agent response");
    }

    const result: AgentResult = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error: any) {
    console.error(`Agent ${agentType} error:`, error);
    throw new Error(`Agent failed: ${error.message}`);
  }
}
