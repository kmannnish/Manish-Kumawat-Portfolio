import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

export type TestimonialRow = Database['public']['Tables']['testimonials']['Row']

/**
 * Loads all visible testimonials sorted by sort_order.
 */
export const getTestimonials = cache(async (): Promise<TestimonialRow[]> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('[queries/testimonials] error fetching testimonials:', error.message)
      return []
    }

    return data || []
  } catch (err) {
    console.error('[queries/testimonials] unexpected error:', err)
    return []
  }
})
