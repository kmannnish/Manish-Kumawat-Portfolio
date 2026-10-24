import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

export type NavItem = Database['public']['Tables']['nav_items']['Row']

/**
 * Loads all visible navigation items in ascending sort_order.
 * Wrapped in React cache() to deduplicate per-request in Server Components.
 */
export const getNavItems = cache(async (): Promise<NavItem[]> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('nav_items')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('[queries/nav] error fetching nav items:', error.message)
      return []
    }

    return data || []
  } catch (err) {
    console.error('[queries/nav] unexpected error:', err)
    return []
  }
})
