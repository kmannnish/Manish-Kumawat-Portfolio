'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { useToast } from '@/components/ui/Toast'
import { AccentSwatchPicker } from '@/components/ui/AccentSwatchPicker'
import { upsertExperience } from '@/app/actions/admin'
import type { Database } from '@/lib/database.types'

type ExperienceRow = Database['public']['Tables']['experience']['Row']

interface ExperienceFormProps {
  initialData?: ExperienceRow | null
}

export function ExperienceForm({ initialData }: ExperienceFormProps) {
  const router = useRouter()
  const toast = useToast()

  const isEditing = Boolean(initialData?.id)

  const [organization, setOrganization] = useState(initialData?.organization || '')
  const [role, setRole] = useState(initialData?.role || '')
  const [location, setLocation] = useState(initialData?.location || '')
  const [employmentType, setEmploymentType] = useState<
    'full-time' | 'contract' | 'advisory' | ''
  >(initialData?.employment_type || 'full-time')

  const [startedOn, setStartedOn] = useState(
    initialData?.started_on || new Date().toISOString().split('T')[0]
  )
  const [endedOn, setEndedOn] = useState(initialData?.ended_on || '')
  const [isOngoing, setIsOngoing] = useState(
    Boolean(initialData?.started_on && !initialData?.ended_on)
  )

  const [accentColor, setAccentColor] = useState<string | null>(
    initialData?.accent_color || '#1C6B52'
  )
  const [summary, setSummary] = useState(initialData?.summary || '')
  const [isVisible, setIsVisible] = useState(initialData?.is_visible ?? true)

  // Highlights (Repeatable list of strings)
  const [highlights, setHighlights] = useState<string[]>(() => {
    if (Array.isArray(initialData?.highlights)) {
      return initialData.highlights as string[]
    }
    return ['']
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAddHighlight() {
    setHighlights((prev) => [...prev, ''])
  }

  function handleRemoveHighlight(index: number) {
    setHighlights((prev) => prev.filter((_, i) => i !== index))
  }

  function handleHighlightChange(index: number, val: string) {
    setHighlights((prev) =>
      prev.map((h, i) => (i === index ? val : h))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const cleanedHighlights = highlights
      .map((h) => h.trim())
      .filter((h) => h.length > 0)

    const payload = {
      id: initialData?.id,
      organization: organization.trim(),
      role: role.trim(),
      location: location.trim() || null,
      employment_type: employmentType || null,
      started_on: startedOn,
      ended_on: isOngoing ? null : endedOn || null,
      summary: summary.trim() || null,
      highlights: cleanedHighlights as any,
      accent_color: accentColor,
      is_visible: isVisible,
    }

    const res = await upsertExperience(payload)

    if (res.success) {
      toast.success(
        isEditing
          ? `Updated role at ${payload.organization}`
          : `Created experience at ${payload.organization}`
      )
      router.push('/admin/experience')
      router.refresh()
    } else {
      setError(res.error || 'Failed to save experience.')
      toast.error(res.error || 'Failed to save experience.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-display pb-20">
      <AdminHeader
        title={isEditing ? `Edit Role: ${initialData?.organization}` : 'New Experience'}
        description="Configure employment history, advisory roles, and deployment trace bars."
        action={
          <div className="flex items-center gap-3">
            <Link
              href="/admin/experience"
              className="px-3 py-1.5 text-xs border border-rule rounded-xs text-ink hover:bg-rule/40 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-1.5 rounded-xs bg-signal text-white text-xs font-medium hover:bg-signal/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        }
      />

      {error && (
        <div
          role="alert"
          className="p-4 rounded-xs border border-mark bg-mark/5 text-xs text-mark font-medium"
        >
          {error}
        </div>
      )}

      {/* ── SECTION 1: ROLE & ORGANIZATION ── */}
      <div className="bg-paper border border-rule rounded-xs p-6 space-y-6">
        <h2 className="text-sm font-semibold tracking-tight text-ink uppercase border-b border-rule pb-2">
          Role Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Organization / Company *
            </label>
            <input
              type="text"
              required
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
              placeholder="e.g. Initech AI Lab"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Role Title *
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
              placeholder="e.g. Forward Deployed AI Lead"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
              placeholder="e.g. Bengaluru, India (Hybrid)"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Employment Type
            </label>
            <select
              value={employmentType}
              onChange={(e) =>
                setEmploymentType(
                  e.target.value as 'full-time' | 'contract' | 'advisory' | ''
                )
              }
              className="w-full px-3 py-2 text-xs border border-rule rounded-xs bg-paper focus:outline-hidden focus:border-signal"
            >
              <option value="full-time">Full-time</option>
              <option value="contract">Contract</option>
              <option value="advisory">Advisory</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">
            Role Summary / Narrative
          </label>
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full p-3 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal leading-relaxed"
            placeholder="High-level overview of the engineering scope and team leadership..."
          />
        </div>

        <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="accent-signal"
          />
          <span className="text-ink font-medium">Visible on public trace chart</span>
        </label>
      </div>

      {/* ── SECTION 2: ACCENT COLOR & TIMELINE ── */}
      <div className="bg-paper border border-rule rounded-xs p-6 space-y-6">
        <h2 className="text-sm font-semibold tracking-tight text-ink uppercase border-b border-rule pb-2">
          Visual Identity & Timeline
        </h2>

        {/* Accent Swatch Picker (6 curated colors) */}
        <AccentSwatchPicker
          value={accentColor}
          onChange={setAccentColor}
          label="Trace Chart Bar Accent Colour *"
        />

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-2">
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Started On *
            </label>
            <input
              type="date"
              required
              value={startedOn}
              onChange={(e) => setStartedOn(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Ended On
            </label>
            <input
              type="date"
              disabled={isOngoing}
              value={endedOn}
              onChange={(e) => setEndedOn(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-rule rounded-xs bg-transparent disabled:opacity-40 focus:outline-hidden focus:border-signal"
            />
          </div>

          <div className="pb-2.5">
            <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isOngoing}
                onChange={(e) => {
                  setIsOngoing(e.target.checked)
                  if (e.target.checked) setEndedOn('')
                }}
                className="accent-signal"
              />
              <span className="text-ink font-medium">
                Active Role / Present (Renders ◆ marker)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: REPEATABLE HIGHLIGHTS ── */}
      <div className="bg-paper border border-rule rounded-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-rule pb-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-ink uppercase">
              Key Highlights & Deliverables
            </h2>
            <p className="text-xxs text-graphite mt-0.5">
              Bullet points displayed when clicking into the role in the trace detail panel.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddHighlight}
            className="text-xs px-2.5 py-1 rounded-xs bg-rule/50 text-ink hover:bg-rule font-medium transition-colors cursor-pointer"
          >
            + Add Bullet
          </button>
        </div>

        {highlights.length === 0 ? (
          <p className="text-xs text-graphite italic py-2 text-center">
            No highlights added.
          </p>
        ) : (
          <div className="space-y-3">
            {highlights.map((h, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2.5 rounded-xs border border-rule bg-paper"
              >
                <span className="text-xxs font-mono text-graphite select-none w-4">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  placeholder="e.g. Scaled internal RAG search query throughput 4x..."
                  value={h}
                  onChange={(e) => handleHighlightChange(idx, e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHighlight(idx)}
                  className="text-mark hover:text-mark/80 text-xs px-2 py-1 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  )
}
