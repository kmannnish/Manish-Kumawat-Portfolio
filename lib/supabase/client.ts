import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for Client Components.
 *
 * Anon key only — every read it performs is subject to RLS. S2 adds the
 * generic once `supabase gen types` has written lib/database.types.ts:
 *   createBrowserClient<Database>(...)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
