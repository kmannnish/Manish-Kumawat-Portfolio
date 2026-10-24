'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

export interface MediaReferences {
  projectMedia: string[]
  coverProjects: string[]
  isOgImage: boolean
  tech: string[]
  posts: string[]
  testimonials: string[]
}

/**
 * Checks all foreign tables to identify if a media file is currently in use.
 */
export async function checkMediaReferences(mediaId: string): Promise<{
  isReferenced: boolean
  references: MediaReferences
}> {
  try {
    const supabase = await createClient()

    const [
      pmRes,
      projRes,
      settingsRes,
      techRes,
      postsRes,
      testRes,
    ] = await Promise.all([
      supabase
        .from('project_media')
        .select('projects(title)')
        .eq('media_id', mediaId),
      supabase
        .from('projects')
        .select('title')
        .eq('cover_media_id', mediaId),
      supabase
        .from('site_settings')
        .select('id')
        .eq('og_image_id', mediaId)
        .maybeSingle(),
      supabase
        .from('tech')
        .select('name')
        .eq('icon_media_id', mediaId),
      supabase
        .from('posts')
        .select('title')
        .eq('cover_media_id', mediaId),
      supabase
        .from('testimonials')
        .select('author_name')
        .eq('author_media_id', mediaId),
    ])

    const projectMedia = (pmRes.data || [])
      .map((row: any) => row.projects?.title)
      .filter(Boolean)
    const coverProjects = (projRes.data || [])
      .map((row: any) => row.title)
      .filter(Boolean)
    const isOgImage = Boolean(settingsRes.data)
    const tech = (techRes.data || [])
      .map((row: any) => row.name)
      .filter(Boolean)
    const posts = (postsRes.data || [])
      .map((row: any) => row.title)
      .filter(Boolean)
    const testimonials = (testRes.data || [])
      .map((row: any) => row.author_name)
      .filter(Boolean)

    const isReferenced =
      projectMedia.length > 0 ||
      coverProjects.length > 0 ||
      isOgImage ||
      tech.length > 0 ||
      posts.length > 0 ||
      testimonials.length > 0

    return {
      isReferenced,
      references: {
        projectMedia,
        coverProjects,
        isOgImage,
        tech,
        posts,
        testimonials,
      },
    }
  } catch (err) {
    console.error('[checkMediaReferences] error:', err)
    return {
      isReferenced: false,
      references: {
        projectMedia: [],
        coverProjects: [],
        isOgImage: false,
        tech: [],
        posts: [],
        testimonials: [],
      },
    }
  }
}

/**
 * Saves or updates a media metadata record in the media table.
 * Enforces alt_text requirement before saving.
 */
export async function saveMediaRecord(
  data: Database['public']['Tables']['media']['Insert'] & { id?: string }
) {
  try {
    if (!data.alt_text || data.alt_text.trim() === '') {
      return { success: false, error: 'Alt text is strictly required before saving an image.' }
    }

    const supabase = await createClient()

    if (data.id) {
      const { error } = await supabase
        .from('media')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)

      if (error) return { success: false, error: error.message }
    } else {
      const { data: inserted, error } = await supabase
        .from('media')
        .insert({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) return { success: false, error: error.message }
      return { success: true, item: inserted }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save media record.' }
  }
}

/**
 * Deletes a media file from Supabase storage and its record from the media table.
 */
export async function deleteMediaRecord(mediaId: string, path: string) {
  try {
    const supabase = await createClient()

    // 1. Delete from storage bucket
    const { error: storageError } = await supabase.storage
      .from('media')
      .remove([path])

    if (storageError) {
      console.warn('[deleteMediaRecord] storage delete warning:', storageError.message)
    }

    // 2. Delete from media table
    const { error: dbError } = await supabase
      .from('media')
      .delete()
      .eq('id', mediaId)

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete media.' }
  }
}

/**
 * Saves a document record to the documents table.
 */
export async function saveDocumentRecord(
  data: Database['public']['Tables']['documents']['Insert'] & { id?: string }
) {
  try {
    if (!data.label || data.label.trim() === '') {
      return { success: false, error: 'Document label is required.' }
    }

    const supabase = await createClient()

    if (data.id) {
      const { error } = await supabase
        .from('documents')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)

      if (error) return { success: false, error: error.message }
    } else {
      const { data: inserted, error } = await supabase
        .from('documents')
        .insert({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) return { success: false, error: error.message }
      return { success: true, item: inserted }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save document record.' }
  }
}

/**
 * Deletes a document file from storage and its table row.
 */
export async function deleteDocumentRecord(documentId: string, path: string) {
  try {
    const supabase = await createClient()

    await supabase.storage.from('documents').remove([path])

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete document.' }
  }
}
