'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import {
  deleteExperience,
  updateExperienceOrder,
  upsertExperience,
} from '@/app/actions/admin'
import type { Database } from '@/lib/database.types'

type ExperienceRow = Database['public']['Tables']['experience']['Row']

export default function AdminExperienceListPage() {
  const [experience, setExperience] = useState<ExperienceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [savingOrder, setSavingOrder] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ExperienceRow | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const toast = useToast()
  const supabase = createClient()

  useEffect(() => {
    setIsMounted(true)
    async function loadData() {
      setLoading(true)
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) {
        toast.error('Failed to load experience.')
      } else if (data) {
        setExperience(data)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    const sourceIdx = result.source.index
    const destIdx = result.destination.index
    if (sourceIdx === destIdx) return

    const reordered = Array.from(experience)
    const [moved] = reordered.splice(sourceIdx, 1)
    reordered.splice(destIdx, 0, moved)

    const updated = reordered.map((e, idx) => ({ ...e, sort_order: idx }))
    setExperience(updated)
    setSavingOrder(true)

    const payload = updated.map((e) => ({ id: e.id, sort_order: e.sort_order }))
    const res = await updateExperienceOrder(payload)
    if (res.success) {
      toast.success('Experience reordered.')
    } else {
      toast.error(res.error || 'Failed to update order.')
    }
    setSavingOrder(false)
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= experience.length) return

    const reordered = Array.from(experience)
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIdx, 0, moved)

    const updated = reordered.map((e, idx) => ({ ...e, sort_order: idx }))
    setExperience(updated)
    setSavingOrder(true)

    const payload = updated.map((e) => ({ id: e.id, sort_order: e.sort_order }))
    const res = await updateExperienceOrder(payload)
    if (res.success) {
      toast.success('Experience reordered.')
    } else {
      toast.error(res.error || 'Failed to update order.')
    }
    setSavingOrder(false)
  }

  async function handleToggleVisibility(id: string) {
    const target = experience.find((e) => e.id === id)
    if (!target) return

    const nextVisibility = !target.is_visible
    setExperience((prev) =>
      prev.map((e) => (e.id === id ? { ...e, is_visible: nextVisibility } : e))
    )

    const res = await upsertExperience({
      id: target.id,
      organization: target.organization,
      role: target.role,
      started_on: target.started_on,
      is_visible: nextVisibility,
    })

    if (res.success) {
      toast.success(`Role visibility set to ${nextVisibility ? 'visible' : 'hidden'}.`)
    } else {
      toast.error('Failed to update visibility.')
    }
  }

  async function handleConfirmDelete() {
    if (!itemToDelete) return

    const res = await deleteExperience(itemToDelete.id)
    if (res.success) {
      toast.success(`Deleted role at ${itemToDelete.organization}`)
      setExperience((prev) => prev.filter((e) => e.id !== itemToDelete.id))
    } else {
      toast.error(res.error || 'Failed to delete role.')
    }
    setItemToDelete(null)
  }

  if (loading || !isMounted) {
    return (
      <div className="py-12 text-center text-xs text-graphite font-display">
        Loading experience...
      </div>
    )
  }

  return (
    <div className="space-y-8 font-display pb-16">
      <AdminHeader
        title="Experience & Employment"
        description="Manage career history and deployment trace chart bars. Renders on the public trace timeline."
        action={
          <Link
            href="/admin/experience/new"
            className="rounded-xs bg-signal text-white px-4 py-2 text-xs font-medium hover:bg-signal/90 transition-colors inline-block cursor-pointer"
          >
            + New Role
          </Link>
        }
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-graphite">
          Showing {experience.length} {experience.length === 1 ? 'role' : 'roles'}. Drag to reorder.
        </p>
        {savingOrder && (
          <span className="text-xxs text-signal font-medium animate-pulse">
            Saving order...
          </span>
        )}
      </div>

      {experience.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-rule rounded-xs">
          <p className="text-xs text-graphite mb-3">No career roles created yet.</p>
          <Link
            href="/admin/experience/new"
            className="text-xs font-medium text-signal hover:underline"
          >
            Add your first role →
          </Link>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="experience-list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-3"
              >
                {experience.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xs border transition-shadow bg-paper gap-4 ${
                          snapshot.isDragging
                            ? 'border-signal shadow-lg bg-paper/95'
                            : 'border-rule hover:border-rule-strong'
                        } ${!item.is_visible ? 'opacity-55' : ''}`}
                      >
                        {/* Left: Drag Handle, Accent swatch, Organization & Role */}
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                          <div
                            {...provided.dragHandleProps}
                            title="Drag to reorder"
                            className="cursor-grab active:cursor-grabbing p-1 text-graphite hover:text-ink transition-colors mt-0.5 sm:mt-0"
                          >
                            <span className="text-sm select-none">⋮⋮</span>
                          </div>

                          {/* Accent swatch square */}
                          <span
                            className="w-3.5 h-3.5 rounded-xs shrink-0 mt-0.5 sm:mt-0 border border-black/10"
                            style={{
                              backgroundColor: item.accent_color || '#1C6B52',
                            }}
                            title={`Accent: ${item.accent_color}`}
                          />

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={`/admin/experience/${item.id}`}
                                className="text-xs font-medium text-ink hover:text-signal transition-colors"
                              >
                                {item.organization}
                              </Link>
                              <span className="text-xs text-graphite font-normal">
                                — {item.role}
                              </span>
                              {item.employment_type && (
                                <span className="text-xxs px-1.5 py-0.5 rounded-xs bg-rule/50 text-graphite capitalize">
                                  {item.employment_type}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xxs text-graphite mt-1">
                              {item.location && <span>{item.location}</span>}
                              <span>
                                {item.started_on} →{' '}
                                {item.ended_on ? item.ended_on : 'Present (Ongoing ◆)'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Visibility toggle & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-rule">
                          {/* Up/Down buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMove(index, 'up')}
                              className="p-1 text-xs text-graphite hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Move up"
                              aria-label="Move up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              disabled={index === experience.length - 1}
                              onClick={() => handleMove(index, 'down')}
                              className="p-1 text-xs text-graphite hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Move down"
                              aria-label="Move down"
                            >
                              ↓
                            </button>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                            <input
                              type="checkbox"
                              checked={item.is_visible}
                              onChange={() => handleToggleVisibility(item.id)}
                              className="accent-signal cursor-pointer"
                            />
                            <span
                              className={`text-xxs font-medium ${
                                item.is_visible ? 'text-signal' : 'text-graphite'
                              }`}
                            >
                              {item.is_visible ? 'Visible' : 'Hidden'}
                            </span>
                          </label>

                          <div className="flex items-center gap-3 ml-2">
                            <Link
                              href={`/admin/experience/${item.id}`}
                              className="text-xs font-medium text-signal hover:underline"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => setItemToDelete(item)}
                              className="text-xs font-medium text-mark hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title={`Delete role at "${itemToDelete?.organization}"?`}
        description="This action cannot be undone. The role and its trace timeline bar will be permanently removed."
        confirmLabel="Permanently Delete"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  )
}
