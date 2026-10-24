import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

export type SectionRow = Database['public']['Tables']['sections']['Row']

/**
 * Loads all visible page sections ordered by sort_order.
 */
export const getSections = cache(async (): Promise<SectionRow[]> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('[queries/sections] error fetching sections:', error.message)
      return []
    }

    return data || []
  } catch (err) {
    console.error('[queries/sections] unexpected error:', err)
    return []
  }
})
