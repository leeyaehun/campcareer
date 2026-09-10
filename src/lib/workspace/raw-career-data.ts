import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase-admin"

type ReadResult = { error: { code?: string } | null }

/**
 * Read a legacy country-occupation record through the server role.
 *
 * Existing production grants predate P0.5 and do not yet allow service_role
 * to select these tables. The narrowly scoped 42501 fallback keeps the
 * application available while the new app is deployed before the privilege
 * migration. Once that migration is applied, the first branch succeeds and
 * anon no longer has table access.
 */
export async function readRawCareerData<T extends ReadResult>(
  read: (client: SupabaseClient) => PromiseLike<T>,
): Promise<T> {
  const serverResult = await read(supabaseAdmin)
  if (!serverResult.error || serverResult.error.code !== "42501") return serverResult

  return read(supabase)
}
