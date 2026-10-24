import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

export type SiteSettings = Database['public']['Tables']['site_settings']['Row']

/**
 * Loads the single site_settings row.
 * Wrapped in React cache() to deduplicate per-request in Server Components.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[queries/settings] error fetching site settings:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.error('[queries/settings] unexpected error:', err)
    return null
  }
})
