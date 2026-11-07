import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Server-only helper around the service-role client that Lovable Cloud injects as
 * SUPABASE_SERVICE_ROLE_KEY. Returns null when the key is not configured (local dev),
 * so callers can fall back to the regular user-scoped client.
 */
export async function getAdminClient(): Promise<SupabaseClient<Database> | null> {
  if (!process.env["SUPABASE_SERVICE_ROLE_KEY"] || !process.env["SUPABASE_URL"]) return null;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** Rejects cross-site calls: the browser always sends Origin on cross-origin POSTs. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
