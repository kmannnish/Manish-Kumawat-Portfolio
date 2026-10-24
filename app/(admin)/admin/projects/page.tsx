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
import { deleteProject, updateProjectsOrder } from '@/app/actions/admin'
import type { Database } from '@/lib/database.types'

type ProjectRow = Database['public']['Tables']['projects']['Row']

export default function AdminProjectsListPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [savingOrder, setSavingOrder] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<ProjectRow | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const toast = useToast()
  const supabase = createClient()

  useEffect(() => {
    setIsMounted(true)
    async function loadProjects() {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) {
        toast.error('Failed to load projects.')
      } else if (data) {
        setProjects(data)
      }
      setLoading(false)
    }
    loadProjects()
  }, [])

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    const sourceIdx = result.source.index
    const destIdx = result.destination.index
    if (sourceIdx === destIdx) return

    const reordered = Array.from(projects)
    const [moved] = reordered.splice(sourceIdx, 1)
    reordered.splice(destIdx, 0, moved)

    const updated = reordered.map((p, idx) => ({ ...p, sort_order: idx }))
    setProjects(updated)
    setSavingOrder(true)

    const payload = updated.map((p) => ({ id: p.id, sort_order: p.sort_order }))
    const res = await updateProjectsOrder(payload)
    if (res.success) {
      toast.success('Projects reordered.')
    } else {
      toast.error(res.error || 'Failed to update order.')
    }
    setSavingOrder(false)
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= projects.length) return

    const reordered = Array.from(projects)
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIdx, 0, moved)

    const updated = reordered.map((p, idx) => ({ ...p, sort_order: idx }))
    setProjects(updated)
    setSavingOrder(true)

    const payload = updated.map((p) => ({ id: p.id, sort_order: p.sort_order }))
    const res = await updateProjectsOrder(payload)
    if (res.success) {
      toast.success('Projects reordered.')
    } else {
      toast.error(res.error || 'Failed to update order.')
    }
    setSavingOrder(false)
  }

  async function handleConfirmDelete() {
    if (!projectToDelete) return

    const res = await deleteProject(projectToDelete.id)
    if (res.success) {
      toast.success(`Deleted "${projectToDelete.title}"`)
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id))
    } else {
      toast.error(res.error || 'Failed to delete project.')
    }
    setProjectToDelete(null)
  }

  if (loading || !isMounted) {
    return (
      <div className="py-12 text-center text-xs text-graphite font-display">
        Loading projects...
      </div>
    )
  }

  return (
    <div className="space-y-8 font-display pb-16">
      <AdminHeader
        title="Projects & Case Studies"
        description="Manage work entries, impact metrics, deployment trace bars, and case studies."
        action={
          <Link
            href="/admin/projects/new"
            className="rounded-xs bg-signal text-white px-4 py-2 text-xs font-medium hover:bg-signal/90 transition-colors inline-block cursor-pointer"
          >
            + New Project
          </Link>
        }
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-graphite">
          Showing {projects.length} {projects.length === 1 ? 'project' : 'projects'}. Drag to reorder.
        </p>
        {savingOrder && (
          <span className="text-xxs text-signal font-medium animate-pulse">
            Saving order...
          </span>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-rule rounded-xs">
          <p className="text-xs text-graphite mb-3">No projects created yet.</p>
          <Link
            href="/admin/projects/new"
            className="text-xs font-medium text-signal hover:underline"
          >
            Create your first project →
          </Link>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="projects-list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-3"
              >
                {projects.map((project, index) => {
                  const metricsArray = Array.isArray(project.metrics)
                    ? (project.metrics as any[])
                    : []
                  const headlineMetric =
                    metricsArray.find((m) => m.is_headline) || metricsArray[0]

                  return (
                    <Draggable
                      key={project.id}
                      draggableId={project.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xs border transition-shadow bg-paper gap-4 ${
                            snapshot.isDragging
                              ? 'border-signal shadow-lg bg-paper/95'
                              : 'border-rule hover:border-rule-strong'
                          }`}
                        >
                          {/* Left: Drag Handle, Accent swatch, and Title */}
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
                                backgroundColor: project.accent_color || '#1C6B52',
                              }}
                              title={`Accent: ${project.accent_color}`}
                            />

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Link
                                  href={`/admin/projects/${project.id}`}
                                  className="text-xs font-medium text-ink hover:text-signal transition-colors truncate"
                                >
                                  {project.title}
                                </Link>
                                <span
                                  className={`text-xxs px-2 py-0.5 rounded-full capitalize font-medium ${
                                    project.status === 'published'
                                      ? 'bg-signal/10 text-signal'
                                      : project.status === 'draft'
                                      ? 'bg-rule/50 text-graphite'
                                      : 'bg-rule/70 text-ink'
                                  }`}
                                >
                                  {project.status}
                                </span>
                                {project.is_featured && (
                                  <span className="text-xxs px-1.5 py-0.5 rounded-xs border border-rule text-graphite">
                                    Featured
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xxs text-graphite mt-1">
                                <span className="font-mono">/work/{project.slug}</span>
                                {project.client_name && (
                                  <span>Client: {project.client_name}</span>
                                )}
                                <span>
                                  {project.started_on} →{' '}
                                  {project.ended_on ? project.ended_on : 'Ongoing ◆'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Headline metric & Controls */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-rule">
                            {headlineMetric && (
                              <div className="text-right hidden sm:block">
                                <span className="text-xs font-medium text-ink font-display block">
                                  {headlineMetric.before
                                    ? `${headlineMetric.before} → `
                                    : ''}
                                  {headlineMetric.after}
                                </span>
                                <span className="text-xxs text-graphite block">
                                  {headlineMetric.label}
                                </span>
                              </div>
                            )}

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
                                disabled={index === projects.length - 1}
                                onClick={() => handleMove(index, 'down')}
                                className="p-1 text-xs text-graphite hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title="Move down"
                                aria-label="Move down"
                              >
                                ↓
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <Link
                                href={`/admin/projects/${project.id}`}
                                className="text-xs font-medium text-signal hover:underline"
                              >
                                Edit
                              </Link>
                              <button
                                type="button"
                                onClick={() => setProjectToDelete(project)}
                                className="text-xs font-medium text-mark hover:underline cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(projectToDelete)}
        title={`Delete "${projectToDelete?.title}"?`}
        description="This action cannot be undone. The project, its case study, metrics, and trace bar will be permanently removed from the database."
        confirmLabel="Permanently Delete"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  )
}
