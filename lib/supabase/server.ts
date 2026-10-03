import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase client for Server Components, Route Handlers and middleware.
 *
 * Anon key, so RLS still applies — this is not a privileged client. Deliberately
 * no `import 'server-only'` here: middleware runs on the edge runtime and
 * legitimately imports this module. The privileged client is admin.ts.
 *
 * S2 adds the generic: createServerClient<Database>(...)
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
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
