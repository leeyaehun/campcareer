import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import { supabaseAdmin } from "@/lib/supabase-admin"

type ReadResult = { error: { code?: string } | null }

/**
 * Read raw country-occupation records only through the server role.
 *
 * P0.5 grants service_role SELECT and removes browser-role privileges and
 * policies from the raw Career tables, so there is no public-client fallback.
 */
export async function readRawCareerData<T extends ReadResult>(
  read: (client: SupabaseClient) => PromiseLike<T>,
): Promise<T> {
  return read(supabaseAdmin)
}
