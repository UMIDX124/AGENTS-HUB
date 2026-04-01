import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const FREE_MODELS = [
  "nvidia/nvidia-nemotron-3-super",
  "qwen/qwen-3.6-plus-preview",
  "openai/gpt-oss-120b",
];

const TOOL_PROMPTS: Record<string, (url: string, context?: string) => string> = {
  "meta-tags": (url) => `You are an SEO expert. Generate perfect meta tags for the website: ${url}

Generate the following HTML code ready to paste into the <head> section:
1. <title> tag (50-60 chars, include primary keyword)
2. <meta name="description"> (150-160 chars, compelling CTA)
3. Open Graph tags (og:title, og:description, og:type, og:url, og:image placeholder)
4. Twitter Card tags
5. Canonical URL tag
6. Viewport and charset tags

Output ONLY the HTML code, no explanations. Make it professional and optimized for CTR.`,

  "schema-markup": (url) => `You are a structured data expert. Generate JSON-LD schema markup for: ${url}

Generate multiple schema types that are appropriate:
1. Organization schema (name, url, logo, social profiles)
2. WebSite schema (with SearchAction)
3. WebPage schema for the homepage
4. BreadcrumbList schema
5. If it looks like a business: LocalBusiness schema

Output ONLY the <script type="application/ld+json"> blocks, ready to paste into HTML. Use realistic data based on the URL.`,

  "content-writer": (url, context) => `You are a senior SEO content writer. Write an SEO-optimized article for: ${url}
${context ? `Target keyword/topic: ${context}` : "Write about the main topic of this website."}

Write a complete article with:
1. SEO-optimized H1 title (include keyword naturally)
2. Meta description suggestion
3. Table of contents
4. 800-1200 word article with H2/H3 subheadings
5. Internal linking suggestions
6. FAQ section (3-5 questions)
7. Call-to-action conclusion

Format in clean Markdown. Make it engaging, informative, and naturally keyword-rich. E-E-A-T compliant.`,

  "robots-txt": (url) => `You are a technical SEO expert. Generate an optimized robots.txt file for: ${url}

Include:
1. User-agent directives (for all bots + specific ones like Googlebot)
2. Disallow rules for admin, private, duplicate content paths
3. Allow rules for important content
4. Crawl-delay if appropriate
5. Sitemap reference
6. Clean comments explaining each section

Output ONLY the robots.txt content, ready to save as a file.`,

  "headlines": (url, context) => `You are a headline copywriting expert. Generate 10 SEO-optimized headlines for: ${url}
${context ? `Target keyword: ${context}` : "Based on the website's niche."}

For each headline provide:
- The headline text (power words, numbers, emotion)
- Target keyword placement
- Estimated search intent match (informational/transactional/navigational)
- Suggested use (blog post / landing page / ad / email subject)

Make headlines clickable, honest, and optimized for both search engines and humans. Format as a numbered list.`,

  "sitemap-fix": (url) => `You are a technical SEO expert. Generate an optimized sitemap.xml for: ${url}

Generate:
1. A proper XML sitemap structure
2. Include common pages (home, about, contact, services, blog, etc.)
3. Set appropriate <priority> values
4. Set appropriate <changefreq> values
5. Include <lastmod> dates
6. Add comments explaining the structure

Also provide:
- Instructions on where to place the sitemap
- How to submit it to Google Search Console
- Common sitemap mistakes to avoid

Output the complete sitemap.xml code first, then the instructions.`,
};

async function callOpenRouter(model: string, prompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3011",
      "X-Title": "SEO Agents Hub - Tools",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Model ${model} failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tool, url, context } = await req.json();

    if (!tool || !url) {
      return NextResponse.json({ error: "Tool and URL are required" }, { status: 400 });
    }

    const promptFn = TOOL_PROMPTS[tool];
    if (!promptFn) {
      return NextResponse.json({ error: "Invalid tool" }, { status: 400 });
    }

    const systemPrompt = promptFn(url, context);
    const userMessage = `Generate the ${tool} output for ${url}. ${context ? `Additional context: ${context}` : ""} Be thorough and provide production-ready code.`;

    let lastError = "";
    for (const model of FREE_MODELS) {
      try {
        const result = await callOpenRouter(model, systemPrompt, userMessage);
        if (result) {
          return NextResponse.json({ result, tool, model });
        }
      } catch (err: any) {
        lastError = err.message;
        continue;
      }
    }

    return NextResponse.json({ error: `All models failed: ${lastError}` }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
