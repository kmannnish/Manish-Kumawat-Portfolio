import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

/**
 * Supabase client for Client Components.
 *
 * Anon key only — every read it performs is subject to RLS.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  return createBrowserClient<Database>(url, anonKey)
}
