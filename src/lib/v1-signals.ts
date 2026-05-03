/**
 * v1-signals — REAL signal extraction for the public audit API.
 *
 * Per the contract in /docs/AGENTS_HUB_INTEGRATION.md and the project memory
 * rule "no fake audit findings": every finding the v1 API returns MUST cite
 * a measurement from one of the 8 trusted sources. This module produces those
 * measurements; the LLM downstream is restricted to writing prose around them.
 *
 * Sources implemented here (the floor):
 *   - cheerio-crawl  — title / meta / h1-h6 / alt-text / OG / canonical / viewport / link counts
 *   - security-headers — HSTS / CSP / X-Frame / X-Content-Type / Referrer-Policy on response
 *   - schema-org     — JSON-LD presence / type
 *
 * Sources NOT implemented yet (deliberately surfaced as gap-notes so users
 * see which knobs unlock more signal coverage):
 *   - lighthouse, crux, search-console, wayback, open-pagerank
 */
import * as cheerio from "cheerio";

export type SignalSource =
  | "lighthouse"
  | "crux"
  | "search-console"
  | "security-headers"
  | "schema-org"
  | "wayback"
  | "open-pagerank"
  | "cheerio-crawl"
  | "multi-page-crawl";

export type SignalSeverity = "critical" | "warn" | "win";

export type Signal = {
  /** Stable id for the signal (e.g. "title.length", "h1.count"). */
  id: string;
  /** Raw measurement string used verbatim in finding.signal. */
  text: string;
  /** Computed severity from numeric thresholds — LLM never picks this. */
  severity: SignalSeverity;
  /** Human-friendly title used as the default finding title. */
  title: string;
  /** Source attribution. */
  source: SignalSource;
  /** Extra context the LLM may use when writing prose. Never invented. */
  context?: Record<string, string | number | boolean | string[] | null>;
};

export type SignalsByPillar = Partial<
  Record<"on-page" | "technical" | "content" | "off-site" | "competitor", Signal[]>
>;

export type CrawlBundle = {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  status: number;
  headers: Record<string, string>;
  html: string;
  signals: SignalsByPillar;
};

const FETCH_TIMEOUT_MS = 9000;

/** One entry point: fetch the URL once and produce the full signal bundle. */
export async function extractCrawlBundle(rawUrl: string): Promise<CrawlBundle> {
  const url = normalizeUrl(rawUrl);
  const fetchedAt = new Date().toISOString();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "user-agent": "CrawlIQ/1.0 (+https://crawliq-sage.vercel.app)" },
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  const finalUrl = res.url || url;
  const status = res.status;
  const headers: Record<string, string> = {};
  res.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v;
  });
  const html = status >= 200 && status < 400 ? await res.text() : "";

  const onPage = extractOnPageSignals(html);
  const technical = extractTechnicalSignals(url, finalUrl, status, headers, html);
  const content = extractContentSignals(html);
  const offSite = extractOffSiteGapNotes();
  const competitor = extractCompetitorGapNotes();

  return {
    url,
    finalUrl,
    fetchedAt,
    status,
    headers,
    html,
    signals: {
      "on-page": onPage,
      technical,
      content,
      "off-site": offSite,
      competitor,
    },
  };
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("empty url");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function severityFromBands(value: number, bands: { warn: number; crit: number; reverse?: boolean }): SignalSeverity {
  if (bands.reverse) {
    if (value <= bands.crit) return "critical";
    if (value <= bands.warn) return "warn";
    return "win";
  }
  if (value >= bands.crit) return "critical";
  if (value >= bands.warn) return "warn";
  return "win";
}

// ─── on-page signals (cheerio-crawl) ────────────────────────────────────────

function extractOnPageSignals(html: string): Signal[] {
  const out: Signal[] = [];
  if (!html) return out;
  const $ = cheerio.load(html);

  // title
  const title = ($("head > title").first().text() || "").trim();
  const titleLen = title.length;
  out.push({
    id: "title.length",
    text: `title: ${titleLen} chars${title ? ` ("${title.slice(0, 60)}${title.length > 60 ? "…" : ""}")` : " (missing)"}`,
    severity:
      titleLen === 0
        ? "critical"
        : titleLen > 60
          ? "warn"
          : titleLen < 30
            ? "warn"
            : "win",
    title:
      titleLen === 0
        ? "Page is missing a <title> tag"
        : titleLen > 60
          ? `Title tag is ${titleLen} chars — Google truncates at ~60`
          : titleLen < 30
            ? `Title tag is only ${titleLen} chars — short titles under-perform`
            : `Title tag length is healthy (${titleLen} chars)`,
    source: "cheerio-crawl",
    context: { value: title, length: titleLen },
  });

  // meta description
  const metaDesc = ($('meta[name="description"]').attr("content") || "").trim();
  const metaLen = metaDesc.length;
  out.push({
    id: "meta-description.length",
    text: `meta-description: ${metaLen} chars${metaDesc ? "" : " (missing)"}`,
    severity:
      metaLen === 0
        ? "critical"
        : metaLen > 160
          ? "warn"
          : metaLen < 80
            ? "warn"
            : "win",
    title:
      metaLen === 0
        ? "Page has no meta description"
        : metaLen > 160
          ? `Meta description is ${metaLen} chars — SERPs truncate at ~160`
          : metaLen < 80
            ? `Meta description is only ${metaLen} chars — too thin to compete in SERPs`
            : `Meta description length is in the optimal range (${metaLen} chars)`,
    source: "cheerio-crawl",
    context: { length: metaLen },
  });

  // h1 count
  const h1s = $("h1");
  const h1Count = h1s.length;
  const firstH1 = (h1s.first().text() || "").trim();
  out.push({
    id: "h1.count",
    text: `h1: ${h1Count} found${firstH1 ? ` ("${firstH1.slice(0, 60)}${firstH1.length > 60 ? "…" : ""}")` : ""}`,
    severity: h1Count === 0 ? "critical" : h1Count > 1 ? "warn" : "win",
    title:
      h1Count === 0
        ? "Page has no <h1> — primary topical signal missing"
        : h1Count > 1
          ? `Page has ${h1Count} <h1> tags — should be exactly one`
          : "Page has exactly one <h1>",
    source: "cheerio-crawl",
    context: { count: h1Count, firstH1 },
  });

  // h2 count
  const h2Count = $("h2").length;
  out.push({
    id: "h2.count",
    text: `h2: ${h2Count} found`,
    severity: h2Count === 0 ? "warn" : "win",
    title:
      h2Count === 0
        ? "Page has no <h2> — heading hierarchy is flat"
        : `Heading hierarchy includes ${h2Count} <h2>s`,
    source: "cheerio-crawl",
    context: { count: h2Count },
  });

  // alt-text coverage
  const imgs = $("img");
  const imgTotal = imgs.length;
  let imgWithAlt = 0;
  imgs.each((_, el) => {
    const alt = ($(el).attr("alt") || "").trim();
    if (alt.length > 0) imgWithAlt += 1;
  });
  const altPct = imgTotal === 0 ? 100 : Math.round((imgWithAlt / imgTotal) * 100);
  out.push({
    id: "alt-text.coverage",
    text: `alt-text coverage: ${altPct}% (${imgWithAlt}/${imgTotal} images)`,
    severity:
      imgTotal === 0
        ? "win"
        : severityFromBands(altPct, { warn: 80, crit: 50, reverse: true }),
    title:
      imgTotal === 0
        ? "No images on page — alt-text not applicable"
        : altPct === 100
          ? `All ${imgTotal} images have alt text`
          : `${imgTotal - imgWithAlt} of ${imgTotal} images are missing alt text (${altPct}% coverage)`,
    source: "cheerio-crawl",
    context: { total: imgTotal, withAlt: imgWithAlt, percent: altPct },
  });

  // canonical
  const canonical = $('link[rel="canonical"]').attr("href") || "";
  out.push({
    id: "canonical.present",
    text: canonical ? `canonical: ${canonical}` : "canonical: missing",
    severity: canonical ? "win" : "warn",
    title: canonical ? "Canonical URL is set" : "Page has no <link rel=\"canonical\">",
    source: "cheerio-crawl",
    context: { value: canonical },
  });

  // OG tags
  const ogTitle = $('meta[property="og:title"]').attr("content") || "";
  const ogImg = $('meta[property="og:image"]').attr("content") || "";
  const ogPresent = !!(ogTitle && ogImg);
  out.push({
    id: "open-graph.complete",
    text: `og:title: ${ogTitle ? "present" : "missing"} · og:image: ${ogImg ? "present" : "missing"}`,
    severity: ogPresent ? "win" : "warn",
    title: ogPresent
      ? "Open Graph tags are set (og:title + og:image)"
      : "Open Graph tags are incomplete — link previews will fall back to defaults",
    source: "cheerio-crawl",
    context: { ogTitle: !!ogTitle, ogImage: !!ogImg },
  });

  // viewport meta
  const viewport = $('meta[name="viewport"]').attr("content") || "";
  out.push({
    id: "viewport.present",
    text: viewport ? `viewport: "${viewport}"` : "viewport: missing",
    severity: viewport ? "win" : "critical",
    title: viewport
      ? "Viewport meta tag is configured for mobile"
      : "Viewport meta tag is missing — mobile rendering will be broken",
    source: "cheerio-crawl",
    context: { value: viewport },
  });

  return out;
}

// ─── technical signals ──────────────────────────────────────────────────────

function extractTechnicalSignals(
  url: string,
  finalUrl: string,
  status: number,
  headers: Record<string, string>,
  html: string,
): Signal[] {
  const out: Signal[] = [];
  // HTTPS
  const isHttps = finalUrl.startsWith("https://");
  out.push({
    id: "https.enabled",
    text: `protocol: ${new URL(finalUrl).protocol}`,
    severity: isHttps ? "win" : "critical",
    title: isHttps ? "Site is served over HTTPS" : "Site is NOT served over HTTPS",
    source: "cheerio-crawl",
    context: { final: finalUrl, https: isHttps },
  });

  // redirect (compare requested vs final URL)
  const redirected = url !== finalUrl;
  out.push({
    id: "redirect.chain",
    text: `redirect: ${redirected ? `${url} → ${finalUrl}` : "none"}`,
    severity: redirected ? "warn" : "win",
    title: redirected
      ? `Request redirected: ${url} → ${finalUrl}`
      : "No redirects on the requested URL",
    source: "cheerio-crawl",
    context: { from: url, to: finalUrl },
  });

  // status
  out.push({
    id: "http.status",
    text: `http: ${status}`,
    severity: status >= 500 ? "critical" : status >= 400 ? "warn" : "win",
    title: `HTTP response status was ${status}`,
    source: "cheerio-crawl",
    context: { status },
  });

  // security headers — security-headers source
  const secHeaders: Array<{ id: string; key: string; humanName: string }> = [
    { id: "header.hsts", key: "strict-transport-security", humanName: "Strict-Transport-Security (HSTS)" },
    { id: "header.csp", key: "content-security-policy", humanName: "Content-Security-Policy" },
    { id: "header.xfo", key: "x-frame-options", humanName: "X-Frame-Options" },
    { id: "header.xcto", key: "x-content-type-options", humanName: "X-Content-Type-Options" },
    { id: "header.referrer", key: "referrer-policy", humanName: "Referrer-Policy" },
  ];
  for (const h of secHeaders) {
    const v = headers[h.key];
    out.push({
      id: h.id,
      text: v ? `${h.key}: "${v}"` : `${h.key}: missing`,
      severity: v ? "win" : "warn",
      title: v
        ? `${h.humanName} is set`
        : `${h.humanName} response header is missing`,
      source: "security-headers",
      context: { value: v ?? null },
    });
  }

  // schema.org JSON-LD
  if (html) {
    const $ = cheerio.load(html);
    const ldScripts = $('script[type="application/ld+json"]');
    const ldCount = ldScripts.length;
    let detectedTypes: string[] = [];
    ldScripts.each((_, el) => {
      try {
        const parsed = JSON.parse($(el).contents().text());
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        for (const node of arr) {
          if (node && typeof node["@type"] === "string") detectedTypes.push(node["@type"]);
        }
      } catch {
        // ignore malformed JSON-LD
      }
    });
    out.push({
      id: "schema-org.present",
      text:
        ldCount === 0
          ? "schema.org JSON-LD: absent"
          : `schema.org JSON-LD: ${ldCount} block(s) — types: ${detectedTypes.join(", ") || "unparseable"}`,
      severity: ldCount === 0 ? "warn" : "win",
      title:
        ldCount === 0
          ? "No schema.org JSON-LD on page"
          : `Page declares schema.org types: ${detectedTypes.join(", ") || "unparseable"}`,
      source: "schema-org",
      context: { count: ldCount, types: detectedTypes },
    });
  }

  return out;
}

// ─── content signals ────────────────────────────────────────────────────────

function extractContentSignals(html: string): Signal[] {
  const out: Signal[] = [];
  if (!html) return out;
  const $ = cheerio.load(html);
  const $body = $("body").clone();
  $body.find("script, style, noscript").remove();
  const bodyText = ($body.text() || "").replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(/\s+/).length : 0;

  out.push({
    id: "body.word-count",
    text: `body word count: ${wordCount}`,
    severity:
      wordCount < 250
        ? "critical"
        : wordCount < 600
          ? "warn"
          : "win",
    title:
      wordCount < 250
        ? `Page body is only ${wordCount} words — too thin for ranking`
        : wordCount < 600
          ? `Page body is ${wordCount} words — competitive pages typically run 600+`
          : `Page body is ${wordCount} words — substantive content depth`,
    source: "cheerio-crawl",
    context: { count: wordCount },
  });

  const internal = $("a[href]")
    .filter((_, el) => {
      const href = $(el).attr("href") || "";
      return /^(\/|#)/.test(href) || (href.startsWith("http") && false);
    })
    .length;
  const external = $("a[href]")
    .filter((_, el) => {
      const href = $(el).attr("href") || "";
      return /^https?:\/\//i.test(href);
    })
    .length;

  out.push({
    id: "links.internal",
    text: `internal links: ${internal}`,
    severity: internal < 5 ? "warn" : "win",
    title: internal < 5
      ? `Only ${internal} internal links on page — limits topical reinforcement`
      : `${internal} internal links found`,
    source: "cheerio-crawl",
    context: { count: internal },
  });

  out.push({
    id: "links.external",
    text: `external links: ${external}`,
    severity: external > 100 ? "warn" : "win",
    title: external > 100
      ? `${external} external links — unusually high; check for link spam`
      : `${external} external links found`,
    source: "cheerio-crawl",
    context: { count: external },
  });

  return out;
}

// ─── off-site / competitor — gap-notes only (per memory rule 6) ─────────────

function extractOffSiteGapNotes(): Signal[] {
  return [
    {
      id: "open-pagerank.unavailable",
      text: "open-pagerank: API not configured",
      severity: "warn",
      title:
        "Off-site authority signals unavailable — set OPEN_PAGERANK_API_KEY to enable",
      source: "open-pagerank",
      context: { configured: false },
    },
    {
      id: "wayback.unavailable",
      text: "wayback: not yet wired into v1 pipeline",
      severity: "warn",
      title: "Domain age signal unavailable — Wayback integration pending",
      source: "wayback",
      context: { configured: false },
    },
  ];
}

function extractCompetitorGapNotes(): Signal[] {
  return [
    {
      id: "serp-pipeline.unavailable",
      text: "competitor SERP analysis: not yet wired into v1 pipeline",
      severity: "warn",
      title:
        "Competitor signals unavailable — SERP pipeline integration pending",
      source: "open-pagerank",
      context: { configured: false },
    },
  ];
}
