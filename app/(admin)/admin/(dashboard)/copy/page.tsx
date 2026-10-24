'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { useToast } from '@/components/ui/Toast'
import { updateCopyKey } from '@/app/actions/admin'
import type { Database } from '@/lib/database.types'

type CopyRow = Database['public']['Tables']['copy']['Row']

interface CopyItemState {
  currentValue: string
  isDirty: boolean
  isSaving: boolean
  lastSavedAt?: number
}

export default function AdminCopyPage() {
  const [items, setItems] = useState<CopyRow[]>([])
  const [itemStates, setItemStates] = useState<Record<string, CopyItemState>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newKey, setNewKey] = useState({
    key: '',
    label: '',
    group_name: 'common',
    kind: 'text' as 'text' | 'richtext' | 'markdown',
    value: '',
    help: '',
  })

  const toast = useToast()
  const supabase = createClient()

  // Fetch all copy rows on mount
  useEffect(() => {
    async function loadCopy() {
      setLoading(true)
      const { data, error } = await supabase
        .from('copy')
        .select('*')
        .order('group_name')
        .order('key')

      if (error) {
        toast.error('Failed to load copy dictionary.')
      } else if (data) {
        setItems(data)
        const initialStates: Record<string, CopyItemState> = {}
        data.forEach((row) => {
          initialStates[row.key] = {
            currentValue: row.value,
            isDirty: false,
            isSaving: false,
          }
        })
        setItemStates(initialStates)
      }
      setLoading(false)
    }

    loadCopy()
  }, [])

  // Derive unique group names
  const groupNames = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if (item.group_name) set.add(item.group_name)
    })
    return ['all', ...Array.from(set).sort()]
  }, [items])

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesGroup =
        selectedGroup === 'all' || item.group_name === selectedGroup
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (itemStates[item.key]?.currentValue || item.value)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      return matchesGroup && matchesSearch
    })
  }, [items, selectedGroup, searchQuery, itemStates])

  // Grouped filtered items
  const groupedItems = useMemo(() => {
    const groups: Record<string, CopyRow[]> = {}
    filteredItems.forEach((item) => {
      const g = item.group_name || 'general'
      if (!groups[g]) groups[g] = []
      groups[g].push(item)
    })
    return groups
  }, [filteredItems])

  function handleValueChange(key: string, newValue: string) {
    const original = items.find((i) => i.key === key)?.value ?? ''
    setItemStates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        currentValue: newValue,
        isDirty: newValue !== original,
      },
    }))
  }

  function handleReset(key: string) {
    const original = items.find((i) => i.key === key)?.value ?? ''
    setItemStates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        currentValue: original,
        isDirty: false,
      },
    }))
  }

  async function handleSave(key: string) {
    const state = itemStates[key]
    if (!state || !state.isDirty || state.isSaving) return

    setItemStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], isSaving: true },
    }))

    const result = await updateCopyKey(key, state.currentValue)

    if (result.success) {
      toast.success(`Updated "${key}"`)
      setItems((prev) =>
        prev.map((i) => (i.key === key ? { ...i, value: state.currentValue } : i))
      )
      setItemStates((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          isDirty: false,
          isSaving: false,
          lastSavedAt: Date.now(),
        },
      }))
    } else {
      toast.error(result.error || `Failed to update ${key}`)
      setItemStates((prev) => ({
        ...prev,
        [key]: { ...prev[key], isSaving: false },
      }))
    }
  }

  async function handleCreateNewKey(e: React.FormEvent) {
    e.preventDefault()
    if (!newKey.key.trim() || !newKey.label.trim()) return

    const { error } = await supabase.from('copy').insert({
      key: newKey.key.trim(),
      label: newKey.label.trim(),
      group_name: newKey.group_name.trim() || 'common',
      kind: newKey.kind,
      value: newKey.value,
      help: newKey.help.trim() || null,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Created copy key "${newKey.key}"`)
      setShowAddModal(false)
      const newItem: CopyRow = {
        key: newKey.key.trim(),
        label: newKey.label.trim(),
        group_name: newKey.group_name.trim() || 'common',
        kind: newKey.kind,
        value: newKey.value,
        help: newKey.help.trim() || null,
        updated_at: new Date().toISOString(),
      }
      setItems((prev) => [...prev, newItem])
      setItemStates((prev) => ({
        ...prev,
        [newItem.key]: {
          currentValue: newItem.value,
          isDirty: false,
          isSaving: false,
        },
      }))
      setNewKey({
        key: '',
        label: '',
        group_name: 'common',
        kind: 'text',
        value: '',
        help: '',
      })
    }
  }

  return (
    <div className="space-y-8 font-display">
      <AdminHeader
        title="Copy & Content"
        description="Every user-facing string is catalogued here. Changes update live across the public site."
        action={
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="rounded-xs bg-ink text-paper px-4 py-2 text-xs font-medium hover:bg-ink/90 transition-colors cursor-pointer"
          >
            + New Copy Key
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pb-6 border-b border-rule">
        <div className="flex flex-wrap gap-1.5 items-center">
          {groupNames.map((g) => {
            const isSelected = selectedGroup === g
            return (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGroup(g)}
                className={`text-xs px-2.5 py-1 rounded-xs transition-colors cursor-pointer capitalize ${
                  isSelected
                    ? 'bg-signal text-white font-medium'
                    : 'bg-rule/40 text-graphite hover:text-ink hover:bg-rule/70'
                }`}
              >
                {g}
              </button>
            )
          })}
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="search"
            placeholder="Search key, label, or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs px-3 py-1.5 bg-paper border border-rule rounded-xs text-ink placeholder:text-graphite/60 focus:outline-hidden focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-graphite">
          Loading copy dictionary...
        </div>
      ) : Object.keys(groupedItems).length === 0 ? (
        <div className="py-12 text-center text-xs text-graphite border border-dashed border-rule rounded-xs">
          No copy strings match your filter.
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedItems).map(([group, groupItems]) => (
            <div key={group} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-rule pb-2">
                <h2 className="text-sm font-semibold tracking-tight text-ink uppercase">
                  {group}
                </h2>
                <span className="text-xxs px-2 py-0.5 rounded-full bg-rule/50 text-graphite font-mono">
                  {groupItems.length} {groupItems.length === 1 ? 'key' : 'keys'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {groupItems.map((item) => {
                  const state = itemStates[item.key] || {
                    currentValue: item.value,
                    isDirty: false,
                    isSaving: false,
                  }
                  const isMultiline =
                    item.kind === 'richtext' || item.kind === 'markdown'

                  return (
                    <div
                      key={item.key}
                      className={`p-4 rounded-xs border transition-colors ${
                        state.isDirty
                          ? 'border-signal/50 bg-signal/5'
                          : 'border-rule bg-paper'
                      }`}
                    >
                      {/* Key metadata line */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-ink">
                            {item.label}
                          </span>
                          <code className="text-xxs px-1.5 py-0.5 rounded-xs bg-rule/40 text-graphite font-mono">
                            {item.key}
                          </code>
                          <span className="text-xxs uppercase tracking-wider px-1.5 py-0.5 rounded-xs border border-rule text-graphite">
                            {item.kind}
                          </span>
                        </div>

                        {item.help && (
                          <span className="text-xxs text-graphite italic">
                            {item.help}
                          </span>
                        )}
                      </div>

                      {/* Input based on kind */}
                      <div className="mt-3">
                        {isMultiline ? (
                          <textarea
                            rows={4}
                            value={state.currentValue}
                            onChange={(e) =>
                              handleValueChange(item.key, e.target.value)
                            }
                            className="w-full text-xs font-sans text-ink bg-transparent border border-rule rounded-xs p-2.5 focus:outline-hidden focus:border-signal focus:ring-1 focus:ring-signal transition-colors leading-relaxed"
                            placeholder="Enter formatted content..."
                          />
                        ) : (
                          <input
                            type="text"
                            value={state.currentValue}
                            onChange={(e) =>
                              handleValueChange(item.key, e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && state.isDirty) {
                                handleSave(item.key)
                              }
                            }}
                            className="w-full text-xs font-sans text-ink bg-transparent border border-rule rounded-xs px-3 py-2 focus:outline-hidden focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
                            placeholder="Enter single line text..."
                          />
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3 flex items-center justify-between pt-2">
                        <div className="text-xxs text-graphite">
                          {state.lastSavedAt && (
                            <span className="text-signal">
                              ✓ Saved at{' '}
                              {new Date(state.lastSavedAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {state.isDirty && (
                            <button
                              type="button"
                              onClick={() => handleReset(item.key)}
                              disabled={state.isSaving}
                              className="text-xs text-graphite hover:text-ink px-2.5 py-1 rounded-xs transition-colors cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSave(item.key)}
                            disabled={!state.isDirty || state.isSaving}
                            className={`text-xs px-3 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
                              state.isDirty
                                ? 'bg-signal text-white hover:bg-signal/90'
                                : 'bg-rule/30 text-graphite/60 cursor-not-allowed'
                            }`}
                          >
                            {state.isSaving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Copy Key Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs font-display"
        >
          <div className="w-full max-w-lg rounded-xs border border-rule bg-paper p-6 shadow-md space-y-4">
            <h3 className="text-base font-medium text-ink">Add New Copy Key</h3>
            <form onSubmit={handleCreateNewKey} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Key (e.g. hero.headline)
                </label>
                <input
                  type="text"
                  required
                  placeholder="section.element.descriptor"
                  value={newKey.key}
                  onChange={(e) =>
                    setNewKey({ ...newKey, key: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Readable label"
                    value={newKey.label}
                    onChange={(e) =>
                      setNewKey({ ...newKey, label: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="hero, work, nav..."
                    value={newKey.group_name}
                    onChange={(e) =>
                      setNewKey({ ...newKey, group_name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Kind
                </label>
                <select
                  value={newKey.kind}
                  onChange={(e) =>
                    setNewKey({
                      ...newKey,
                      kind: e.target.value as 'text' | 'richtext' | 'markdown',
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-rule rounded-xs bg-paper focus:outline-hidden focus:border-signal"
                >
                  <option value="text">Single-line Text</option>
                  <option value="richtext">Rich Text / Multiline</option>
                  <option value="markdown">Markdown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Help Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Where does this text appear?"
                  value={newKey.help}
                  onChange={(e) =>
                    setNewKey({ ...newKey, help: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Initial Value
                </label>
                <textarea
                  rows={3}
                  value={newKey.value}
                  onChange={(e) =>
                    setNewKey({ ...newKey, value: e.target.value })
                  }
                  placeholder="Content text..."
                  className="w-full p-2.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xs border border-rule px-4 py-2 text-xs font-medium text-ink hover:bg-rule/40 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xs bg-signal text-white px-4 py-2 text-xs font-medium hover:bg-signal/90 transition-colors cursor-pointer"
                >
                  Add Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
