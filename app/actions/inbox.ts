'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

type SubmissionStatus = Database['public']['Enums']['submission_status']

/**
 * Updates submission status (new, read, replied, archived, spam).
 * Automatically sets replied_at timestamp if status transitioned to 'replied'.
 */
export async function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus
) {
  try {
    const supabase = await createClient()

    const updateData: Database['public']['Tables']['contact_submissions']['Update'] = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'replied') {
      updateData.replied_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('contact_submissions')
      .update(updateData)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update status.' }
  }
}

/**
 * Updates internal notes for a contact submission.
 */
export async function updateSubmissionNotes(id: string, notes: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('contact_submissions')
      .update({
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save notes.' }
  }
}

/**
 * Permanently deletes a submission.
 */
export async function deleteSubmission(id: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete submission.' }
  }
}
