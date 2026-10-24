import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { CopyMap } from '@/lib/copy'

/**
 * Loads the complete copy dictionary from the `copy` table.
 * Wrapped in React cache() to deduplicate per-request in Server Components.
 */
export const getCopyMap = cache(async (): Promise<CopyMap> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('copy').select('key, value')

    if (error || !data) {
      if (error) console.error('[queries/copy] error fetching copy map:', error.message)
      return {}
    }

    const map: CopyMap = {}
    for (const row of data) {
      if (row.key) {
        map[row.key] = row.value
      }
    }
    return map
  } catch (err) {
    console.error('[queries/copy] unexpected error:', err)
    return {}
  }
})
