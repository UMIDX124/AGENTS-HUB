import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const GITHUB_MODELS_URL = "https://models.github.ai/inference/chat/completions";

const MODELS_FALLBACK_CHAIN = [
  "openai/gpt-5",
  "deepseek/DeepSeek-V3-0324",
  "meta/Llama-4-Scout-17B-16E-Instruct",
];

const VALID_TOOLS = [
  "meta-tags",
  "schema-markup",
  "content-writer",
  "robots-txt",
  "headlines",
  "sitemap-fix",
  "social-posts",
  "outreach-email",
  "keyword-research",
  "backlink-finder",
  "internal-linking",
  "site-audit",
  "rank-check",
  "weekly-report",
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

  "social-posts": `You are a social media marketing expert with deep SEO knowledge. Given a website URL and topic, create social media posts.

Generate posts for these platforms:
1. **Twitter/X** (3 tweets — 280 chars each, with hashtags)
2. **LinkedIn** (1 professional post — 1000-1300 chars, with hooks and CTA)
3. **Facebook** (1 engaging post — 300-500 chars, with emoji and CTA)
4. **Instagram** (1 caption — 200 chars + 30 hashtags grouped at bottom)

Each post should:
- Drive traffic back to the website
- Include relevant keywords naturally
- Have a compelling hook in the first line
- Include a clear call-to-action

Format with clear section headers for each platform.`,

  "outreach-email": `You are a link-building outreach specialist. Given a website URL, write professional backlink request emails.

Generate 3 different email templates:
1. **Guest Post Pitch** — offer to write valuable content for their blog
2. **Resource Page Request** — ask to be added to their resource/links page
3. **Broken Link Replacement** — offer your content as replacement for broken links

Each email should:
- Have a compelling subject line (A/B test variants)
- Personalization placeholders: [THEIR_NAME], [THEIR_SITE], [SPECIFIC_ARTICLE]
- Be under 150 words (short = higher reply rate)
- Show genuine familiarity with their content
- Provide clear value proposition
- Have a soft CTA (not pushy)
- Include a follow-up email template

Format each template with Subject, Body, and Follow-up sections.`,

  "keyword-research": `You are an SEO keyword research expert. Given a website URL and optional seed keyword, perform comprehensive keyword research.

Provide:
1. **Primary Keywords** (5-10) — high volume, medium-high difficulty
   - Keyword, estimated monthly search volume, difficulty (1-100), intent type
2. **Long-Tail Keywords** (15-20) — lower volume, lower difficulty, higher conversion
   - Keyword, estimated volume, difficulty, why it's a good opportunity
3. **Question Keywords** (10) — "how to", "what is", "why" queries
   - Great for FAQ pages and featured snippets
4. **LSI Keywords** (10) — semantically related terms to include in content
5. **Competitor Keywords** (5) — keywords competitors rank for that you should target
6. **Content Cluster Plan** — group keywords into topic clusters with pillar + support pages

Format as organized tables/lists. Estimates should be realistic based on niche.`,

  "backlink-finder": `You are a backlink analysis expert. Given a website URL, identify backlink opportunities.

Provide:
1. **Competitor Analysis** — identify 5 likely competitors and where they get backlinks
2. **Easy Win Opportunities** (10) — directories, profiles, forums where you can get links today
   - Site name, URL pattern, DA estimate, link type (dofollow/nofollow), effort level
3. **Guest Post Targets** (10) — blogs in the niche that accept guest posts
   - Blog name, estimated DA, topic relevance, submission URL pattern
4. **Resource Page Targets** (5) — pages that link to similar resources
5. **Broken Link Opportunities** (5) — common broken link patterns in the niche
6. **HARO/Journalist Opportunities** — how to get press mentions
7. **Link Building Priority Plan** — which tactics to focus on first (by effort vs. impact)

Be specific and actionable. Include estimated difficulty and impact for each.`,

  "internal-linking": `You are an internal linking strategy expert. Given a website URL, create an internal linking plan.

Provide:
1. **Recommended Site Architecture** — ideal hierarchy (homepage → category → subcategory → pages)
2. **Pillar Page Strategy** — identify 3-5 pillar topics with cluster pages
3. **Linking Rules** — how many internal links per page, anchor text best practices
4. **Navigation Optimization** — what should be in header/footer nav
5. **Contextual Link Suggestions** — where to add links within existing content
6. **Orphan Page Detection** — common pages that often have no internal links
7. **Anchor Text Map** — recommended anchor texts for key pages (avoid over-optimization)
8. **Implementation Checklist** — step by step guide to implement the linking strategy

Format as a structured document with clear sections and action items.`,

  "site-audit": `You are a technical SEO auditor. Given a website URL, perform a comprehensive technical audit.

Check and report on:
1. **Critical Issues** — things that are likely broken and blocking rankings
   - HTTPS/SSL status, canonical tags, noindex tags, redirect chains
2. **Page Speed Analysis** — common issues and specific fixes
   - Image optimization, CSS/JS minification, caching headers, lazy loading
3. **Mobile Usability** — responsive design checklist
4. **Crawlability** — robots.txt analysis, sitemap status, crawl budget
5. **Indexability** — pages that should/shouldn't be indexed
6. **Structured Data** — what's missing and what to add
7. **Core Web Vitals** — LCP, FID/INP, CLS optimization tips
8. **Security** — mixed content, vulnerable libraries
9. **International SEO** — hreflang if applicable
10. **Fix Priority Matrix** — ranked list of what to fix first (impact vs effort)

For each issue, provide the EXACT fix (code snippet, config change, or tool to use).`,

  "rank-check": `You are an SEO rank tracking analyst. Given a website URL and target keywords, provide a rank analysis.

Provide:
1. **Estimated Current Rankings** — based on domain strength and content analysis
   - Keyword, estimated position range, search volume, competition level
2. **Ranking Factors Analysis** — what's helping and hurting rankings
   - Content quality score, backlink strength, technical health, page speed
3. **Quick Win Keywords** — keywords where you're close to page 1 (positions 11-20)
4. **Keyword Gap** — keywords you SHOULD rank for but probably don't
5. **SERP Feature Opportunities** — featured snippets, PAA, local pack opportunities
6. **90-Day Ranking Improvement Plan** — specific actions to improve rankings
   - Week 1-2: Quick fixes
   - Week 3-4: Content optimization
   - Month 2: Link building
   - Month 3: Advanced optimization
7. **KPI Targets** — realistic ranking goals for 30/60/90 days

Note: These are educated estimates based on SEO best practices, not live rank data.`,

  "weekly-report": `You are an SEO reporting specialist. Given a website URL, generate a comprehensive weekly SEO report template.

Generate:
1. **Executive Summary** — 3-sentence overview of SEO health
2. **Key Metrics Dashboard** (with realistic sample data)
   - Organic traffic trend, keyword rankings, backlink count, domain authority
   - Top 10 performing pages, top 10 keywords
3. **This Week's Changes** — what was done, what changed
4. **Issues Found** — new problems discovered this week
5. **Wins & Improvements** — positive changes to celebrate
6. **Competitor Movement** — what competitors are doing
7. **Recommendations** — top 5 action items for next week
8. **Content Calendar** — suggested posts for next 2 weeks with keywords
9. **Link Building Progress** — outreach sent, links acquired
10. **Technical Health Score** — overall site health percentage

Format as a professional report template that can be filled in weekly. Include placeholder data.`,
};

async function scrapeWebsite(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "SEOAgentsHub/1.0 (SEO Audit Bot)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return `[Could not fetch: HTTP ${res.status}]`;
    const html = await res.text();

    // Extract useful text from HTML
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    const h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi);

    // Strip HTML tags helper
    const strip = (s: string) => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

    // Get body text (strip scripts, styles, tags)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyText = "";
    if (bodyMatch) {
      bodyText = bodyMatch[1]
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<nav[\s\S]*?<\/nav>/gi, "")
        .replace(/<footer[\s\S]*?<\/footer>/gi, "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 2000);
    }

    const title = titleMatch ? strip(titleMatch[1]) : "N/A";
    const metaDesc = metaDescMatch ? metaDescMatch[1] : "N/A";
    const headings1 = h1Match ? h1Match.map(strip).join(", ") : "N/A";
    const headings2 = h2Match ? h2Match.slice(0, 8).map(strip).join(", ") : "N/A";

    return `
=== REAL WEBSITE DATA (scraped live) ===
Title: ${title}
Meta Description: ${metaDesc}
H1 Headings: ${headings1}
H2 Headings: ${headings2}
Page Content (first 2000 chars): ${bodyText}
=== END WEBSITE DATA ===`;
  } catch (err: any) {
    return `[Scrape failed: ${err.message}]`;
  }
}

function buildUserPrompt(
  tool: ToolName,
  url: string,
  context?: string,
  scrapedContent?: string
): string {
  let prompt = `Website URL: ${url}`;
  if (scrapedContent) {
    prompt += `\n\n${scrapedContent}\n\nIMPORTANT: Use the REAL website data above to make your output highly specific and personalized. Do NOT generate generic content — reference actual services, products, and content from the website.`;
  }
  if (context) {
    prompt += `\n\nAdditional context from user: ${context}`;
  }
  return prompt;
}

async function callGitHubModels(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const token = process.env.GITHUB_MODELS_TOKEN;
  if (!token) {
    throw new Error("GITHUB_MODELS_TOKEN is not configured");
  }

  let lastError: Error | null = null;

  for (const model of MODELS_FALLBACK_CHAIN) {
    try {
      const response = await fetch(GITHUB_MODELS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-GitHub-Api-Version": "2026-03-10",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt + "\n\nIMPORTANT: Output ONLY the requested content. Do NOT add conversational phrases like 'Let me know if you need anything', 'Feel free to ask', 'I hope this helps', 'Here is the output', or any chatbot-style responses. Just deliver the content directly." },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `GitHub Models API error (${response.status}): ${errorBody}`
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

    // Auto-add https:// if missing
    let validUrl = url.trim();
    if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
      validUrl = "https://" + validUrl;
    }

    try {
      new URL(validUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL. Try: example.com" },
        { status: 400 }
      );
    }

    const toolName = tool as ToolName;
    const systemPrompt = TOOL_SYSTEM_PROMPTS[toolName];

    // Scrape real website content first
    const scrapedContent = await scrapeWebsite(validUrl);
    const userPrompt = buildUserPrompt(toolName, validUrl, context, scrapedContent);

    const result = await callGitHubModels(systemPrompt, userPrompt);

    return NextResponse.json({ result, tool: toolName });
  } catch (error: any) {
    console.error("SEO tools API error:", error);
    return NextResponse.json(
      { error: error.message || "Tool execution failed" },
      { status: 500 }
    );
  }
}
