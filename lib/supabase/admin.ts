import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

/**
 * Privileged Supabase client. Bypasses RLS entirely.
 *
 * The `server-only` import above is load-bearing: it makes law #3 a build
 * error rather than a convention. Any 'use client' file that imports this
 * module — directly or through a chain — fails the build instead of shipping
 * the service role key to the browser.
 *
 * Only two callers are planned: app/api/contact/route.ts (S8) and admin
 * mutations (S11+). Never reach for this when server.ts would do; using the
 * service role where the anon client works silently discards RLS.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'

  return createSupabaseClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
