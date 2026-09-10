import "server-only"

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-only session client. Use this for request-bound Auth and RLS-protected
 * user state. Product reads that need private evidence belong behind a
 * server-only read model and use the service-role client deliberately.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase public environment variables are required when a server session request is executed.')
  }

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
