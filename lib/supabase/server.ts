import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

/**
 * Supabase client for Server Components, Route Handlers and middleware.
 *
 * Anon key, so RLS still applies — this is not a privileged client. Deliberately
 * no `import 'server-only'` here: middleware runs on the edge runtime and
 * legitimately imports this module. The privileged client is admin.ts.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Components get a read-only cookie store, so this throws
            // there. Safe to swallow: middleware.ts is what actually refreshes
            // the session cookie.
          }
        },
      },
    }
  )
}

/**
 * Static client for build-time operations like generateStaticParams()
 * where no HTTP request or cookie store exists.
 * Uses anon key subject to RLS. Returns null if environment variables are unset.
 */
export function createStaticClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return null
  }

  try {
    return createSupabaseClient<Database>(url, key)
  } catch {
    return null
  }
}
