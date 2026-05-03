/**
 * CORS headers for /api/v1/* endpoints.
 *
 * Allow origin defaults to the CrawlIQ Vercel deployment; override via
 * `CORS_ALLOW_ORIGIN` env var (e.g. for a custom CrawlIQ domain).
 */

export function v1AllowOrigin(): string {
  return process.env.CORS_ALLOW_ORIGIN || "https://crawliq-sage.vercel.app";
}

export function v1CorsHeaders(): Record<string, string> {
  return {
    "access-control-allow-origin": v1AllowOrigin(),
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers":
      "content-type, x-api-key, x-internal-key, accept",
    "access-control-max-age": "86400",
    vary: "origin",
  };
}
