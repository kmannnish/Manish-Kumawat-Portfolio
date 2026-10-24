import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

export type PostRow = Database['public']['Tables']['posts']['Row']

/**
 * Loads all published blog/writing posts sorted by published_at desc.
 */
export const getPublishedPosts = cache(async (): Promise<PostRow[]> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('[queries/posts] error fetching posts:', error.message)
      return []
    }

    return data || []
  } catch (err) {
    console.error('[queries/posts] unexpected error:', err)
    return []
  }
})
