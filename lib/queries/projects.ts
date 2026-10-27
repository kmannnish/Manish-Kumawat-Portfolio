import { cache } from 'react'
import { createClient, createStaticClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

export type ProjectRow = Database['public']['Tables']['projects']['Row']
export type TechRow = Database['public']['Tables']['tech']['Row']
export type MediaRow = Database['public']['Tables']['media']['Row']

export interface ProjectWithTech extends ProjectRow {
  tech: TechRow[]
  cover?: MediaRow | null
  headlineMetric?: {
    label: string
    before?: string
    after?: string
    unit?: string
    is_headline?: boolean
  } | null
}

export interface ProjectDetail extends ProjectWithTech {
  media: Array<{
    role: 'cover' | 'gallery' | 'inline'
    sort_order: number
    media: MediaRow
  }>
}

/**
 * Fetch all published projects for the Work index on the home page.
 */
export const getPublishedProjects = cache(async (): Promise<ProjectWithTech[]> => {
  try {
    const supabase = await createClient()

    // Query projects with related tech and cover media
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        cover:media!projects_cover_media_id_fkey (*),
        project_tech (
          tech (*)
        )
      `)
      .eq('status', 'published')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('[queries/projects] error fetching published projects:', error.message)
      return []
    }

    return (data || []).map((row: any) => {
      const techList: TechRow[] = (row.project_tech || [])
        .map((pt: any) => pt.tech)
        .filter(Boolean)

      // Find the metric flagged is_headline
      const metricsList = Array.isArray(row.metrics) ? row.metrics : []
      const headlineMetric = metricsList.find((m: any) => m.is_headline === true) || null

      return {
        ...row,
        tech: techList,
        cover: row.cover || null,
        headlineMetric,
      }
    })
  } catch (err) {
    console.error('[queries/projects] unexpected error:', err)
    return []
  }
})

/**
 * Fetch all project slugs (both published and archived) for generateStaticParams().
 * Uses createStaticClient() because generateStaticParams() runs at build time without HTTP cookies.
 */
export const getAllProjectSlugs = cache(async (): Promise<string[]> => {
  try {
    const supabase = createStaticClient()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('projects')
      .select('slug')
      .in('status', ['published', 'archived'])

    if (error) {
      console.error('[queries/projects] error fetching slugs:', error.message)
      return []
    }

    return (data || []).map((r) => r.slug).filter(Boolean)
  } catch (err) {
    console.error('[queries/projects] unexpected error:', err)
    return []
  }
})

/**
 * Fetch a single project by slug (published or archived) with its tech and media gallery.
 */
export const getProjectBySlug = cache(
  async (slug: string): Promise<ProjectDetail | null> => {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_tech (
            tech (*)
          ),
          project_media (
            role,
            sort_order,
            media (*)
          )
        `)
        .eq('slug', slug)
        .in('status', ['published', 'archived'])
        .maybeSingle()

      if (error || !data) {
        if (error) console.error('[queries/projects] error fetching project:', error.message)
        return null
      }

      const row: any = data
      const techList: TechRow[] = (row.project_tech || [])
        .map((pt: any) => pt.tech)
        .filter(Boolean)

      const mediaList = (row.project_media || [])
        .filter((pm: any) => Boolean(pm.media))
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))

      const metricsList = Array.isArray(row.metrics) ? row.metrics : []
      const headlineMetric = metricsList.find((m: any) => m.is_headline === true) || null

      return {
        ...row,
        tech: techList,
        media: mediaList,
        headlineMetric,
      }
    } catch (err) {
      console.error('[queries/projects] unexpected error:', err)
      return null
    }
  }
)

/**
 * Fetch all projects for the Archive table (both published and archived).
 */
export const getArchiveProjects = cache(async (): Promise<ProjectWithTech[]> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_tech (
          tech (*)
        )
      `)
      .in('status', ['published', 'archived'])
      .order('started_on', { ascending: false })

    if (error) {
      console.error('[queries/projects] error fetching archive projects:', error.message)
      return []
    }

    return (data || []).map((row: any) => {
      const techList: TechRow[] = (row.project_tech || [])
        .map((pt: any) => pt.tech)
        .filter(Boolean)

      const metricsList = Array.isArray(row.metrics) ? row.metrics : []
      const headlineMetric = metricsList.find((m: any) => m.is_headline === true) || null

      return {
        ...row,
        tech: techList,
        headlineMetric,
      }
    })
  } catch (err) {
    console.error('[queries/projects] unexpected error:', err)
    return []
  }
})
