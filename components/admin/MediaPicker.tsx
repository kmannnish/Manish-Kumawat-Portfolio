'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'

type MediaRow = Database['public']['Tables']['media']['Row']

interface MediaPickerProps {
  value: string | null
  onChange: (mediaId: string | null) => void
  label?: string
}

export function MediaPicker({
  value,
  onChange,
  label = 'Cover Media / Image',
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mediaList, setMediaList] = useState<MediaRow[]>([])
  const [selectedItem, setSelectedItem] = useState<MediaRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function loadCurrent() {
      if (!value) {
        setSelectedItem(null)
        return
      }
      const { data } = await supabase
        .from('media')
        .select('*')
        .eq('id', value)
        .maybeSingle()

      if (data) setSelectedItem(data)
    }
    loadCurrent()
  }, [value])

  async function openModal() {
    setIsOpen(true)
    setLoading(true)
    const { data } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setMediaList(data)
    setLoading(false)
  }

  function getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  const filtered = mediaList.filter((m) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return m.alt_text.toLowerCase().includes(q) || m.path.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-2 font-display">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-ink">
          {label}
        </label>
        {selectedItem && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xxs text-mark hover:underline cursor-pointer"
          >
            Remove Selection
          </button>
        )}
      </div>

      {/* Selected media preview box */}
      <div className="flex items-center gap-4 p-3 rounded-xs border border-rule bg-paper">
        {selectedItem ? (
          <>
            <div className="w-16 h-16 shrink-0 rounded-xs bg-rule/30 overflow-hidden border border-rule flex items-center justify-center">
              <img
                src={getPublicUrl(selectedItem.bucket, selectedItem.path)}
                alt={selectedItem.alt_text}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink truncate">
                {selectedItem.alt_text || 'Media asset'}
              </p>
              <p className="text-xxs text-graphite font-mono truncate mt-0.5">
                {selectedItem.path}
              </p>
              <p className="text-xxs text-graphite mt-0.5">
                {selectedItem.width && selectedItem.height
                  ? `${selectedItem.width} × ${selectedItem.height}`
                  : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="px-3 py-1.5 text-xs rounded-xs border border-rule text-ink hover:bg-rule/40 transition-colors cursor-pointer shrink-0"
            >
              Change
            </button>
          </>
        ) : (
          <div className="flex items-center justify-between w-full py-1">
            <span className="text-xs text-graphite italic">
              No cover media attached.
            </span>
            <button
              type="button"
              onClick={openModal}
              className="px-3 py-1.5 text-xs rounded-xs bg-rule/50 text-ink hover:bg-rule transition-colors font-medium cursor-pointer"
            >
              Choose from Library
            </button>
          </div>
        )}
      </div>

      {/* Media Picker Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs font-display"
        >
          <div className="w-full max-w-3xl rounded-xs border border-rule bg-paper p-6 shadow-md space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <h3 className="text-base font-medium text-ink">
                Select from Media Library
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-graphite hover:text-ink text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-1">
              <input
                type="search"
                placeholder="Filter by alt text or filename..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {loading ? (
                <div className="py-12 text-center text-xs text-graphite">
                  Loading library...
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-xs text-graphite italic border border-dashed border-rule rounded-xs">
                  No media items match your search.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {filtered.map((item) => {
                    const isCurrent = item.id === value
                    const publicUrl = getPublicUrl(item.bucket, item.path)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onChange(item.id)
                          setSelectedItem(item)
                          setIsOpen(false)
                        }}
                        className={`group p-2 rounded-xs border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-signal ring-2 ring-signal/30 bg-signal/5'
                            : 'border-rule hover:border-rule-strong bg-paper'
                        }`}
                      >
                        <div className="aspect-video w-full rounded-xs bg-rule/20 overflow-hidden mb-2">
                          <img
                            src={publicUrl}
                            alt={item.alt_text}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                          />
                        </div>
                        <p className="text-xxs font-medium text-ink truncate line-clamp-1">
                          {item.alt_text}
                        </p>
                        <p className="text-xxs text-graphite font-mono truncate mt-0.5">
                          {item.path}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-rule">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xs border border-rule text-ink hover:bg-rule/40 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
