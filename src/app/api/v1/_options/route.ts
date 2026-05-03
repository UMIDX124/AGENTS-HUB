import { v1CorsHeaders } from "@/lib/v1-cors";

/**
 * Generic CORS preflight handler for /api/v1/* routes.
 *
 * Each concrete v1 route (e.g. /api/v1/audit, /api/v1/audit/stream) also
 * exports its own OPTIONS handler so preflights for those exact paths are
 * served directly. This file documents the canonical CORS response and
 * provides a callable endpoint at /api/v1/_options for diagnostics.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: v1CorsHeaders() });
}

export async function GET() {
  return new Response(null, { status: 204, headers: v1CorsHeaders() });
}
