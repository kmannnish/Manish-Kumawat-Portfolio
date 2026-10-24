import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

/**
 * Fetches the max updated_at timestamp across all published content
 * by calling the Postgres security definer function content_last_updated().
 * Wrapped in React cache() to deduplicate per-request in Server Components.
 */
export const getContentLastUpdated = cache(async (): Promise<string | null> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('content_last_updated')

    if (error) {
      console.error('[queries/freshness] error fetching content_last_updated:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.error('[queries/freshness] unexpected error:', err)
    return null
  }
})
