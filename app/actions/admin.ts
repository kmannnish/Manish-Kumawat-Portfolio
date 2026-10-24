'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

type SiteSettingsUpdate = Database['public']['Tables']['site_settings']['Update']

/**
 * Updates a single copy item and revalidates public routes.
 */
export async function updateCopyKey(key: string, value: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('copy')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update copy key.' }
  }
}

/**
 * Updates site settings row and revalidates public routes.
 */
export async function updateSiteSettings(updates: SiteSettingsUpdate) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('site_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', true)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update site settings.' }
  }
}

/**
 * Updates section sort orders and visibility.
 */
export async function updateSections(
  items: Array<{ id: string; sort_order: number; is_visible: boolean }>
) {
  try {
    const supabase = await createClient()

    for (const item of items) {
      const { error } = await supabase
        .from('sections')
        .update({
          sort_order: item.sort_order,
          is_visible: item.is_visible,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)

      if (error) {
        return { success: false, error: error.message }
      }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update sections.' }
  }
}

/**
 * Updates nav items sort orders and visibility.
 */
export async function updateNavItems(
  items: Array<{
    id: string
    label: string
    href: string
    sort_order: number
    is_visible: boolean
    is_external: boolean
  }>
) {
  try {
    const supabase = await createClient()

    for (const item of items) {
      const { error } = await supabase
        .from('nav_items')
        .update({
          label: item.label,
          href: item.href,
          sort_order: item.sort_order,
          is_visible: item.is_visible,
          is_external: item.is_external,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)

      if (error) {
        return { success: false, error: error.message }
      }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update nav items.' }
  }
}

/**
 * Force manual revalidation of the entire site cache.
 */
export async function revalidateSite() {
  try {
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message }
  }
}

/**
 * Upsert Project (Create or Update)
 */
export async function upsertProject(
  projectData: Database['public']['Tables']['projects']['Insert'] & { id?: string },
  techIds?: string[]
) {
  try {
    const supabase = await createClient()

    // 1. Validation: Block publishing when metrics is empty
    if (projectData.status === 'published') {
      const metrics = projectData.metrics
      const hasMetrics = Array.isArray(metrics) && metrics.length > 0
      if (!hasMetrics) {
        return {
          success: false,
          error: 'Projects require at least one impact metric to be published.',
        }
      }
    }

    // 2. Slug uniqueness check
    if (projectData.slug) {
      let query = supabase
        .from('projects')
        .select('id')
        .eq('slug', projectData.slug)

      if (projectData.id) {
        query = query.neq('id', projectData.id)
      }

      const { data: existing } = await query.maybeSingle()
      if (existing) {
        return {
          success: false,
          error: `The slug "${projectData.slug}" is already in use by another project.`,
        }
      }
    }

    let savedId = projectData.id

    if (projectData.id) {
      // Update
      const { error } = await supabase
        .from('projects')
        .update({
          ...projectData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectData.id)

      if (error) {
        return { success: false, error: error.message }
      }
    } else {
      // Insert
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (error) {
        return { success: false, error: error.message }
      }
      savedId = data?.id
    }

    // 3. Update project_tech associations if techIds provided
    if (savedId && Array.isArray(techIds)) {
      // Delete old associations
      await supabase.from('project_tech').delete().eq('project_id', savedId)

      if (techIds.length > 0) {
        const rows = techIds.map((tech_id) => ({
          project_id: savedId,
          tech_id,
        }))
        const { error: techError } = await supabase.from('project_tech').insert(rows)
        if (techError) {
          console.error('[project_tech] insert error:', techError.message)
        }
      }
    }

    revalidatePath('/', 'layout')
    revalidatePath('/archive', 'page')
    if (projectData.slug) {
      revalidatePath(`/work/${projectData.slug}`, 'page')
    }

    return { success: true, id: savedId }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save project.' }
  }
}

/**
 * Delete a project
 */
export async function deleteProject(id: string) {
  try {
    const supabase = await createClient()

    // Delete associations first
    await supabase.from('project_tech').delete().eq('project_id', id)
    await supabase.from('project_media').delete().eq('project_id', id)

    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    revalidatePath('/archive', 'page')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete project.' }
  }
}

/**
 * Reorder projects
 */
export async function updateProjectsOrder(
  items: Array<{ id: string; sort_order: number }>
) {
  try {
    const supabase = await createClient()

    for (const item of items) {
      const { error } = await supabase
        .from('projects')
        .update({
          sort_order: item.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)

      if (error) return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    revalidatePath('/archive', 'page')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update projects order.' }
  }
}

/**
 * Upsert Experience (Create or Update)
 */
export async function upsertExperience(
  data: Database['public']['Tables']['experience']['Insert'] & { id?: string }
) {
  try {
    const supabase = await createClient()

    if (data.id) {
      const { error } = await supabase
        .from('experience')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)

      if (error) return { success: false, error: error.message }
    } else {
      const { error } = await supabase
        .from('experience')
        .insert({
          ...data,
          updated_at: new Date().toISOString(),
        })

      if (error) return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save experience.' }
  }
}

/**
 * Delete Experience
 */
export async function deleteExperience(id: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('experience').delete().eq('id', id)
    if (error) return { success: false, error: error.message }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete experience.' }
  }
}

/**
 * Reorder Experience
 */
export async function updateExperienceOrder(
  items: Array<{ id: string; sort_order: number }>
) {
  try {
    const supabase = await createClient()

    for (const item of items) {
      const { error } = await supabase
        .from('experience')
        .update({
          sort_order: item.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)

      if (error) return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update experience order.' }
  }
}

