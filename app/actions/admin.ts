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
