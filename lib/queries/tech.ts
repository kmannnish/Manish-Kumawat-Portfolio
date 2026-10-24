import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

export type TechItem = Database['public']['Tables']['tech']['Row']

export interface TechGroup {
  category: TechItem['category']
  label: string
  items: TechItem[]
}

const CATEGORY_LABELS: Record<TechItem['category'], string> = {
  language: 'Languages',
  framework: 'Frameworks & Libraries',
  model: 'AI & Models',
  infra: 'Infrastructure & Database',
  data: 'Data & Storage',
  tooling: 'Tools & DevOps',
  design: 'Design & Motion',
}

/**
 * Loads all tech grouped by category in defined display order.
 */
export const getTechByCategory = cache(async (): Promise<TechGroup[]> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tech')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('[queries/tech] error fetching tech:', error.message)
      return []
    }

    const items: TechItem[] = (data as TechItem[]) || []
    const categoryOrder: Array<TechItem['category']> = [
      'model',
      'language',
      'framework',
      'infra',
      'data',
      'tooling',
      'design',
    ]

    const groups: TechGroup[] = []

    for (const cat of categoryOrder) {
      const catItems = items.filter((i: TechItem) => i.category === cat)
      if (catItems.length > 0) {
        groups.push({
          category: cat,
          label: CATEGORY_LABELS[cat] || cat,
          items: catItems,
        })
      }
    }

    return groups
  } catch (err) {
    console.error('[queries/tech] unexpected error:', err)
    return []
  }
})
