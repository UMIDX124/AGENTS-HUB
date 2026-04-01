import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const MODELS_FALLBACK_CHAIN = [
  "nvidia/nemotron-3-super:free",
  "qwen/qwen-3.6-plus-preview:free",
  "openai/gpt-oss-120b:free",
];

const VALID_TOOLS = [
  "meta-tags",
  "schema-markup",
  "content-writer",
  "robots-txt",
  "headlines",
  "sitemap-fix",
] as const;

type ToolName = (typeof VALID_TOOLS)[number];

const TOOL_SYSTEM_PROMPTS: Record<ToolName, string> = {
  "meta-tags": `You are an expert SEO specialist. Given a website URL, generate production-ready HTML meta tags.

Output the following as valid HTML code ready to paste into the <head> section:
- <title> tag (50-60 characters, includes primary keyword)
- <meta name="description"> (150-160 characters, compelling with CTA)
- Open Graph tags: og:title, og:description, og:type, og:url, og:image (use a placeholder URL for image)
- Twitter Card tags: twitter:card, twitter:title, twitter:description, twitter:image
- Canonical URL tag
- <meta name="robots" content="index, follow">

Output ONLY the HTML code block. No explanations before or after the code.`,

  "schema-markup": `You are a structured data expert. Given a website URL, generate comprehensive JSON-LD structured data.

Output multiple <script type="application/ld+json"> blocks for:
1. Organization schema (name, url, logo, sameAs for social profiles)
2. WebPage schema (name, description, url, isPartOf)
3. BreadcrumbList schema (with logical breadcrumb items based on the URL path)
4. FAQPage schema (generate 3-5 relevant FAQs based on the website niche)

Each schema block must be valid JSON-LD that passes Google's Rich Results Test.
Output ONLY the HTML script blocks. No explanations before or after the code.`,

  "content-writer": `You are a senior SEO content writer. Given a website URL and optional context, write a fully optimized blog post.

Requirements:
- H1 title with primary keyword (60-70 characters)
- Meta description suggestion (150-160 characters)
- 800-1200 word article with proper heading hierarchy (H2, H3)
- Natural keyword placement (1-2% density)
- Internal linking suggestions marked as [INTERNAL LINK: anchor text -> /suggested-path]
- External authority link suggestions marked as [EXTERNAL LINK: anchor text -> domain]
- Include a compelling introduction with hook
- Add a clear conclusion with CTA
- Use short paragraphs (2-3 sentences max)
- Include bullet points or numbered lists where appropriate

Output the content in clean Markdown format.`,

  "robots-txt": `You are a technical SEO expert specializing in crawl optimization. Given a website URL, generate an optimal robots.txt file.

Requirements:
- Separate rules for major bots (Googlebot, Bingbot, general User-agent: *)
- Block common non-public paths (/admin, /api, /private, /tmp, /cgi-bin)
- Block duplicate content paths and URL parameters
- Allow critical resources (CSS, JS, images) for rendering
- Include Sitemap directive pointing to /sitemap.xml
- Add crawl-delay for non-Google bots
- Add comments explaining each section

Output ONLY the robots.txt content. No explanations before or after the code.`,

  headlines: `You are a headline optimization specialist with deep SEO and copywriting expertise. Given a website URL, generate 10 keyword-optimized headlines.

Requirements for each headline:
- Include a primary keyword naturally
- 50-65 characters in length
- Use power words that drive clicks (Ultimate, Essential, Proven, etc.)
- Mix headline types: How-to, Listicle, Question, Statement, Comparison
- Include numbers where appropriate
- Optimize for both search engines and human readers

Output format (numbered list):
1. [Headline] - Type: [type] | Characters: [count] | Target keyword: [keyword]

Output ONLY the numbered list. No explanations before or after.`,

  "sitemap-fix": `You are a technical SEO expert specializing in XML sitemaps. Given a website URL, generate sitemap.xml recommendations and a template.

Provide:
1. A valid XML sitemap template with proper namespace declarations
2. Priority values based on page importance (homepage 1.0, main pages 0.8, blog posts 0.6, etc.)
3. Recommended changefreq values per page type
4. A sitemap index file template if the site likely needs multiple sitemaps
5. Common sitemap issues to check (broken URLs, non-canonical URLs, blocked-by-robots pages)
6. Image sitemap extension example if applicable

Output valid XML code blocks with comments explaining the structure.`,
};

function buildUserPrompt(
  tool: ToolName,
  url: string,
  context?: string
): string {
  const base = `Website URL: ${url}`;
  if (context) {
    return `${base}\n\nAdditional context: ${context}`;
  }
  return base;
}

async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  let lastError: Error | null = null;

  for (const model of MODELS_FALLBACK_CHAIN) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
          "X-Title": "SEO Agents Hub - Tools",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `OpenRouter API error (${response.status}): ${errorBody}`
        );
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("Empty response from model");
      }

      return content;
    } catch (error: any) {
      lastError = error;
      console.warn(
        `Model ${model} failed, trying next fallback:`,
        error.message
      );
      continue;
    }
  }

  throw new Error(
    `All models failed. Last error: ${lastError?.message || "Unknown error"}`
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tool, url, context } = body as {
      tool: string;
      url: string;
      context?: string;
    };

    if (!tool || !url) {
      return NextResponse.json(
        { error: "Both 'tool' and 'url' fields are required" },
        { status: 400 }
      );
    }

    if (!VALID_TOOLS.includes(tool as ToolName)) {
      return NextResponse.json(
        {
          error: `Invalid tool. Must be one of: ${VALID_TOOLS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid URL format. Provide a full URL (e.g., https://example.com)",
        },
        { status: 400 }
      );
    }

    const toolName = tool as ToolName;
    const systemPrompt = TOOL_SYSTEM_PROMPTS[toolName];
    const userPrompt = buildUserPrompt(toolName, url, context);

    const result = await callOpenRouter(systemPrompt, userPrompt);

    return NextResponse.json({ result, tool: toolName });
  } catch (error: any) {
    console.error("SEO tools API error:", error);
    return NextResponse.json(
      { error: error.message || "Tool execution failed" },
      { status: 500 }
    );
  }
}
