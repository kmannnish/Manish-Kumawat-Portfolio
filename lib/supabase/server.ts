import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

function createFallbackClient() {
  const queryBuilder: any = {
    select: () => queryBuilder,
    insert: () => queryBuilder,
    update: () => queryBuilder,
    delete: () => queryBuilder,
    eq: () => queryBuilder,
    in: () => queryBuilder,
    gte: () => queryBuilder,
    order: () => queryBuilder,
    limit: () => queryBuilder,
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: [], error: null }),
  }

  return {
    from: () => queryBuilder,
    rpc: async () => ({ data: null, error: null }),
    storage: {
      from: () => ({
        getPublicUrl: (path: string) => ({ data: { publicUrl: path } }),
      }),
    },
  } as unknown as ReturnType<typeof createServerClient<Database>>
}

/**
 * Static client for build-time operations like generateStaticParams(),
 * sitemap.ts, or opengraph-image where no HTTP request cookies exist.
 * Uses anon key subject to RLS.
 */
export function createStaticClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || !url.startsWith('http')) {
    return null
  }

  try {
    return createSupabaseClient<Database>(url, key)
  } catch {
    return null
  }
}

/**
 * Supabase client for Server Components, Route Handlers and middleware.
 *
 * Anon key, so RLS still applies — this is not a privileged client.
 * Falls back to createStaticClient() when executed in static contexts
 * (e.g. sitemap, _not-found, opengraph-image) where cookies() is not available,
 * or createFallbackClient() if environment variables are not yet configured.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || !url.startsWith('http')) {
    return createFallbackClient()
  }

  let cookieStore: any = null

  try {
    cookieStore = await cookies()
  } catch {
    // When executing in a build-time or static context
    const staticClient = createStaticClient()
    if (staticClient) {
      return staticClient as any
    }
  }

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore ? cookieStore.getAll() : []
      },
      setAll(cookiesToSet) {
        if (!cookieStore) return
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components get a read-only cookie store
        }
      },
    },
  })
}
