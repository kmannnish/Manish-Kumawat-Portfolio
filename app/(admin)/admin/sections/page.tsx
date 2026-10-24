'use client'

import { useState, useEffect } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { useToast } from '@/components/ui/Toast'
import { updateSections, updateNavItems } from '@/app/actions/admin'
import type { Database } from '@/lib/database.types'

type SectionRow = Database['public']['Tables']['sections']['Row']
type NavItemRow = Database['public']['Tables']['nav_items']['Row']

export default function AdminSectionsPage() {
  const [activeTab, setActiveTab] = useState<'sections' | 'nav'>('sections')
  const [sections, setSections] = useState<SectionRow[]>([])
  const [navItems, setNavItems] = useState<NavItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [savingSections, setSavingSections] = useState(false)
  const [savingNav, setSavingNav] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // New Nav Item state
  const [newNavLabel, setNewNavLabel] = useState('')
  const [newNavHref, setNewNavHref] = useState('')
  const [newNavExternal, setNewNavExternal] = useState(false)

  const toast = useToast()
  const supabase = createClient()

  useEffect(() => {
    setIsMounted(true)

    async function loadData() {
      setLoading(true)

      const [sectionsRes, navRes] = await Promise.all([
        supabase.from('sections').select('*').order('sort_order', { ascending: true }),
        supabase.from('nav_items').select('*').order('sort_order', { ascending: true }),
      ])

      if (sectionsRes.data) {
        setSections(sectionsRes.data)
      }
      if (navRes.data) {
        setNavItems(navRes.data)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  // ── Drag & Drop Handlers ───────────────────────────────────────────────────

  async function handleSectionDragEnd(result: DropResult) {
    if (!result.destination) return
    const sourceIdx = result.source.index
    const destIdx = result.destination.index
    if (sourceIdx === destIdx) return

    const reordered = Array.from(sections)
    const [moved] = reordered.splice(sourceIdx, 1)
    reordered.splice(destIdx, 0, moved)

    // Update sort_order numbers
    const updated = reordered.map((item, index) => ({
      ...item,
      sort_order: index,
    }))

    setSections(updated)
    setSavingSections(true)

    const payload = updated.map((s) => ({
      id: s.id,
      sort_order: s.sort_order,
      is_visible: s.is_visible,
    }))

    const res = await updateSections(payload)
    if (res.success) {
      toast.success('Section ordering updated.')
    } else {
      toast.error(res.error || 'Failed to update section order.')
    }
    setSavingSections(false)
  }

  async function handleNavDragEnd(result: DropResult) {
    if (!result.destination) return
    const sourceIdx = result.source.index
    const destIdx = result.destination.index
    if (sourceIdx === destIdx) return

    const reordered = Array.from(navItems)
    const [moved] = reordered.splice(sourceIdx, 1)
    reordered.splice(destIdx, 0, moved)

    const updated = reordered.map((item, index) => ({
      ...item,
      sort_order: index,
    }))

    setNavItems(updated)
    setSavingNav(true)

    const res = await updateNavItems(updated)
    if (res.success) {
      toast.success('Navigation ordering updated.')
    } else {
      toast.error(res.error || 'Failed to update navigation order.')
    }
    setSavingNav(false)
  }

  // ── Section Actions ────────────────────────────────────────────────────────

  async function handleToggleSectionVisibility(id: string) {
    const updated = sections.map((s) =>
      s.id === id ? { ...s, is_visible: !s.is_visible } : s
    )
    setSections(updated)

    const target = updated.find((s) => s.id === id)
    if (!target) return

    const { error } = await supabase
      .from('sections')
      .update({ is_visible: target.is_visible, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      toast.error('Failed to toggle visibility.')
    } else {
      toast.success(`Section ${target.kind} is now ${target.is_visible ? 'visible' : 'hidden'}.`)
      const payload = updated.map((s) => ({
        id: s.id,
        sort_order: s.sort_order,
        is_visible: s.is_visible,
      }))
      await updateSections(payload)
    }
  }

  async function handleMoveSection(index: number, direction: 'up' | 'down') {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= sections.length) return

    const reordered = Array.from(sections)
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIdx, 0, moved)

    const updated = reordered.map((s, idx) => ({ ...s, sort_order: idx }))
    setSections(updated)
    setSavingSections(true)

    const payload = updated.map((s) => ({
      id: s.id,
      sort_order: s.sort_order,
      is_visible: s.is_visible,
    }))
    const res = await updateSections(payload)
    if (res.success) {
      toast.success('Section reordered.')
    } else {
      toast.error(res.error || 'Failed to update section.')
    }
    setSavingSections(false)
  }

  // ── Nav Actions ────────────────────────────────────────────────────────────

  async function handleToggleNavVisibility(id: string) {
    const updated = navItems.map((n) =>
      n.id === id ? { ...n, is_visible: !n.is_visible } : n
    )
    setNavItems(updated)
    await updateNavItems(updated)
    toast.success('Navigation item visibility updated.')
  }

  async function handleMoveNav(index: number, direction: 'up' | 'down') {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= navItems.length) return

    const reordered = Array.from(navItems)
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIdx, 0, moved)

    const updated = reordered.map((n, idx) => ({ ...n, sort_order: idx }))
    setNavItems(updated)
    setSavingNav(true)

    const res = await updateNavItems(updated)
    if (res.success) {
      toast.success('Navigation reordered.')
    } else {
      toast.error(res.error || 'Failed to update navigation order.')
    }
    setSavingNav(false)
  }

  async function handleAddNavItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newNavLabel.trim() || !newNavHref.trim()) return

    const sortOrder = navItems.length

    const { data, error } = await supabase
      .from('nav_items')
      .insert({
        label: newNavLabel.trim(),
        href: newNavHref.trim(),
        is_external: newNavExternal,
        is_visible: true,
        sort_order: sortOrder,
      })
      .select()
      .single()

    if (error) {
      toast.error(error.message)
    } else if (data) {
      toast.success(`Added navigation item "${data.label}"`)
      setNavItems((prev) => [...prev, data])
      setNewNavLabel('')
      setNewNavHref('')
      setNewNavExternal(false)
    }
  }

  async function handleDeleteNavItem(id: string) {
    const { error } = await supabase.from('nav_items').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Navigation item removed.')
      const updated = navItems.filter((n) => n.id !== id).map((n, idx) => ({ ...n, sort_order: idx }))
      setNavItems(updated)
      await updateNavItems(updated)
    }
  }

  if (loading || !isMounted) {
    return (
      <div className="py-12 text-center text-xs text-graphite font-display">
        Loading sections & navigation...
      </div>
    )
  }

  return (
    <div className="space-y-8 font-display pb-16">
      <AdminHeader
        title="Sections & Navigation"
        description="Drag to reorder page layout and header navigation. Changes revalidate public routes instantly."
      />

      {/* Tabs */}
      <div className="flex border-b border-rule gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('sections')}
          className={`pb-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'sections'
              ? 'border-signal text-signal font-semibold'
              : 'border-transparent text-graphite hover:text-ink'
          }`}
        >
          Page Sections Composer ({sections.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('nav')}
          className={`pb-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'nav'
              ? 'border-signal text-signal font-semibold'
              : 'border-transparent text-graphite hover:text-ink'
          }`}
        >
          Navigation Menu Items ({navItems.length})
        </button>
      </div>

      {/* ── TAB 1: SECTIONS COMPOSER ── */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-graphite">
              Drag items or use arrow buttons to rearrange the vertical flow of the homepage.
            </p>
            {savingSections && (
              <span className="text-xxs text-signal font-medium animate-pulse">
                Saving section layout...
              </span>
            )}
          </div>

          <DragDropContext onDragEnd={handleSectionDragEnd}>
            <Droppable droppableId="sections-list">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3"
                >
                  {sections.map((section, index) => (
                    <Draggable
                      key={section.id}
                      draggableId={section.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center justify-between p-4 rounded-xs border transition-shadow bg-paper ${
                            snapshot.isDragging
                              ? 'border-signal shadow-lg bg-paper/95'
                              : 'border-rule hover:border-rule-strong'
                          } ${!section.is_visible ? 'opacity-55' : ''}`}
                        >
                          {/* Drag handle & identification */}
                          <div className="flex items-center gap-3">
                            <div
                              {...provided.dragHandleProps}
                              title="Drag to reorder"
                              className="cursor-grab active:cursor-grabbing p-1.5 text-graphite hover:text-ink transition-colors"
                            >
                              <span className="text-sm select-none">⋮⋮</span>
                            </div>

                            <span className="font-mono text-xxs px-2 py-0.5 rounded-full bg-rule/50 text-graphite">
                              #{index + 1}
                            </span>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-ink uppercase tracking-wider">
                                  {section.kind}
                                </span>
                                {section.title && (
                                  <span className="text-xs text-graphite">
                                    — {section.title}
                                  </span>
                                )}
                              </div>
                              {section.subtitle && (
                                <p className="text-xxs text-graphite mt-0.5">
                                  {section.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Controls: move arrows & visibility toggle */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMoveSection(index, 'up')}
                                className="p-1 text-xs text-graphite hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title="Move up"
                                aria-label={`Move ${section.kind} up`}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                disabled={index === sections.length - 1}
                                onClick={() => handleMoveSection(index, 'down')}
                                className="p-1 text-xs text-graphite hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title="Move down"
                                aria-label={`Move ${section.kind} down`}
                              >
                                ↓
                              </button>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                              <input
                                type="checkbox"
                                checked={section.is_visible}
                                onChange={() =>
                                  handleToggleSectionVisibility(section.id)
                                }
                                className="accent-signal cursor-pointer"
                              />
                              <span
                                className={`text-xxs font-medium ${
                                  section.is_visible
                                    ? 'text-signal'
                                    : 'text-graphite'
                                }`}
                              >
                                {section.is_visible ? 'Visible' : 'Hidden'}
                              </span>
                            </label>
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
        </div>
      )}

      {/* ── TAB 2: NAVIGATION ITEMS ── */}
      {activeTab === 'nav' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <p className="text-xs text-graphite">
              Configure top-bar navigation items and external links.
            </p>
            {savingNav && (
              <span className="text-xxs text-signal font-medium animate-pulse">
                Saving navigation...
              </span>
            )}
          </div>

          <DragDropContext onDragEnd={handleNavDragEnd}>
            <Droppable droppableId="nav-list">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3"
                >
                  {navItems.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center justify-between p-4 rounded-xs border transition-shadow bg-paper ${
                            snapshot.isDragging
                              ? 'border-signal shadow-lg bg-paper/95'
                              : 'border-rule hover:border-rule-strong'
                          } ${!item.is_visible ? 'opacity-55' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              {...provided.dragHandleProps}
                              title="Drag to reorder"
                              className="cursor-grab active:cursor-grabbing p-1.5 text-graphite hover:text-ink transition-colors"
                            >
                              <span className="text-sm select-none">⋮⋮</span>
                            </div>

                            <span className="font-mono text-xxs px-2 py-0.5 rounded-full bg-rule/50 text-graphite">
                              #{index + 1}
                            </span>

                            <div>
                              <span className="text-xs font-medium text-ink">
                                {item.label}
                              </span>
                              <span className="text-xxs text-graphite ml-2 font-mono">
                                {item.href}
                              </span>
                              {item.is_external && (
                                <span className="ml-2 text-xxs border border-rule px-1 rounded-xs text-graphite">
                                  external
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMoveNav(index, 'up')}
                                className="p-1 text-xs text-graphite hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title="Move up"
                                aria-label={`Move ${item.label} up`}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                disabled={index === navItems.length - 1}
                                onClick={() => handleMoveNav(index, 'down')}
                                className="p-1 text-xs text-graphite hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title="Move down"
                                aria-label={`Move ${item.label} down`}
                              >
                                ↓
                              </button>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                              <input
                                type="checkbox"
                                checked={item.is_visible}
                                onChange={() =>
                                  handleToggleNavVisibility(item.id)
                                }
                                className="accent-signal cursor-pointer"
                              />
                              <span
                                className={`text-xxs font-medium ${
                                  item.is_visible
                                    ? 'text-signal'
                                    : 'text-graphite'
                                }`}
                              >
                                {item.is_visible ? 'Visible' : 'Hidden'}
                              </span>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleDeleteNavItem(item.id)}
                              className="text-mark hover:underline text-xs cursor-pointer ml-2"
                              title="Delete navigation item"
                            >
                              Delete
                            </button>
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

          {/* Add New Nav Item Form */}
          <div className="bg-paper border border-rule rounded-xs p-6 space-y-4">
            <h3 className="text-xs font-semibold tracking-tight text-ink uppercase">
              Add New Navigation Item
            </h3>
            <form onSubmit={handleAddNavItem} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xxs font-medium text-ink mb-1">
                  Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Writing"
                  value={newNavLabel}
                  onChange={(e) => setNewNavLabel(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xxs font-medium text-ink mb-1">
                  Target URL / Path
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. #writing or /archive"
                  value={newNavHref}
                  onChange={(e) => setNewNavHref(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                />
              </div>

              <div className="flex items-center gap-4 pb-1">
                <label className="flex items-center gap-1.5 text-xxs text-graphite cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newNavExternal}
                    onChange={(e) => setNewNavExternal(e.target.checked)}
                    className="accent-signal"
                  />
                  <span>External?</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xs bg-signal text-white text-xs font-medium hover:bg-signal/90 transition-colors cursor-pointer shrink-0"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
