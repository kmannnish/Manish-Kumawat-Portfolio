import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

type MediaRow = Database['public']['Tables']['media']['Row']

/**
 * Fetch visual media assets suitable for design gallery display (posters, prints, stage, mockups).
 */
export const getDesignMedia = cache(async (): Promise<MediaRow[]> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .in('kind', ['poster', 'print', 'stage', 'mockup'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[queries/media] error fetching design media:', error.message)
      return []
    }

    return data || []
  } catch (err) {
    console.error('[queries/media] unexpected error:', err)
    return []
  }
})
