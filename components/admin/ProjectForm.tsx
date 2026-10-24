'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { useToast } from '@/components/ui/Toast'
import { AccentSwatchPicker } from '@/components/ui/AccentSwatchPicker'
import { upsertProject } from '@/app/actions/admin'
import type { Database } from '@/lib/database.types'

type ProjectRow = Database['public']['Tables']['projects']['Row']
type TechRow = Database['public']['Tables']['tech']['Row']

interface MetricItem {
  label: string
  before?: string | null
  after: string
  unit?: string
  is_headline: boolean
}

interface LinkItem {
  label: string
  url: string
}

interface ProjectFormProps {
  initialData?: ProjectRow | null
  initialTechIds?: string[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function ProjectForm({ initialData, initialTechIds = [] }: ProjectFormProps) {
  const router = useRouter()
  const toast = useToast()
  const supabase = createClient()

  const isEditing = Boolean(initialData?.id)

  // Fields
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialData?.slug))
  const [clientName, setClientName] = useState(initialData?.client_name || '')
  const [role, setRole] = useState(initialData?.role || '')
  const [summary, setSummary] = useState(initialData?.summary || '')
  const [problem, setProblem] = useState(initialData?.problem || '')
  const [approach, setApproach] = useState(initialData?.approach || '')
  const [outcome, setOutcome] = useState(initialData?.outcome || '')
  const [body, setBody] = useState(initialData?.body || '')
  const [bodyTab, setBodyTab] = useState<'write' | 'preview'>('write')
  const [accentColor, setAccentColor] = useState<string | null>(
    initialData?.accent_color || '#1C6B52'
  )
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(
    initialData?.status || 'draft'
  )
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? true)
  const [showInDesign, setShowInDesign] = useState(
    initialData?.show_in_design_section ?? false
  )

  // Dates
  const [startedOn, setStartedOn] = useState(
    initialData?.started_on || new Date().toISOString().split('T')[0]
  )
  const [endedOn, setEndedOn] = useState(initialData?.ended_on || '')
  const [isOngoing, setIsOngoing] = useState(
    Boolean(initialData?.started_on && !initialData?.ended_on)
  )

  // Metrics
  const [metrics, setMetrics] = useState<MetricItem[]>(() => {
    if (Array.isArray(initialData?.metrics) && initialData.metrics.length > 0) {
      return initialData.metrics as unknown as MetricItem[]
    }
    return [
      {
        label: 'Primary Metric',
        before: '',
        after: '99%',
        unit: '%',
        is_headline: true,
      },
    ]
  })

  // Links
  const [links, setLinks] = useState<LinkItem[]>(() => {
    if (Array.isArray(initialData?.links) && initialData.links.length > 0) {
      return initialData.links as unknown as LinkItem[]
    }
    return []
  })

  // Tech list & selected
  const [availableTech, setAvailableTech] = useState<TechRow[]>([])
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>(initialTechIds)

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || '')
  const [seoDescription, setSeoDescription] = useState(
    initialData?.seo_description || ''
  )

  // Form submission state
  const [saving, setSaving] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Load available tech
  useEffect(() => {
    async function loadTech() {
      const { data } = await supabase.from('tech').select('*').order('name')
      if (data) setAvailableTech(data)
    }
    loadTech()
  }, [])

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!slugManuallyEdited) {
      setSlug(slugify(val))
    }
  }

  // ── Metrics helpers ──
  function handleAddMetric() {
    setMetrics((prev) => [
      ...prev,
      {
        label: '',
        before: '',
        after: '',
        unit: '',
        is_headline: prev.length === 0,
      },
    ])
  }

  function handleRemoveMetric(index: number) {
    setMetrics((prev) => {
      const next = prev.filter((_, i) => i !== index)
      // Ensure at least one is headline if any remain
      if (next.length > 0 && !next.some((m) => m.is_headline)) {
        next[0].is_headline = true
      }
      return next
    })
  }

  function handleMetricChange(
    index: number,
    field: keyof MetricItem,
    val: any
  ) {
    setMetrics((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          if (field === 'is_headline') {
            return { ...item, is_headline: true }
          }
          return { ...item, [field]: val }
        }
        if (field === 'is_headline') {
          return { ...item, is_headline: false }
        }
        return item
      })
    )
  }

  // ── Links helpers ──
  function handleAddLink() {
    setLinks((prev) => [...prev, { label: 'Live Demo', url: 'https://' }])
  }

  function handleRemoveLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index))
  }

  function handleLinkChange(index: number, field: keyof LinkItem, val: string) {
    setLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: val } : l))
    )
  }

  // ── Tech toggle ──
  function handleToggleTech(techId: string) {
    setSelectedTechIds((prev) =>
      prev.includes(techId) ? prev.filter((id) => id !== techId) : [...prev, techId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError(null)

    // Validation: Block publishing when metrics is empty
    if (status === 'published' && metrics.length === 0) {
      setValidationError(
        'Projects require at least one impact metric to be published.'
      )
      toast.error('Cannot publish project without impact metrics.')
      return
    }

    setSaving(true)

    const payload = {
      id: initialData?.id,
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      summary: summary.trim(),
      problem: problem.trim() || null,
      approach: approach.trim() || null,
      outcome: outcome.trim() || null,
      body: body.trim(),
      client_name: clientName.trim() || null,
      role: role.trim() || null,
      accent_color: accentColor,
      status,
      is_featured: isFeatured,
      show_in_design_section: showInDesign,
      started_on: startedOn,
      ended_on: isOngoing ? null : endedOn || null,
      metrics: metrics as any,
      links: links as any,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      published_at:
        status === 'published'
          ? initialData?.published_at || new Date().toISOString()
          : null,
    }

    const res = await upsertProject(payload, selectedTechIds)

    if (res.success) {
      toast.success(
        isEditing
          ? `Updated project "${payload.title}"`
          : `Created project "${payload.title}"`
      )
      router.push('/admin/projects')
      router.refresh()
    } else {
      setValidationError(res.error || 'Failed to save project.')
      toast.error(res.error || 'Failed to save project.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-display pb-20">
      <AdminHeader
        title={isEditing ? `Edit Project: ${initialData?.title}` : 'New Project'}
        description="Configure project case study, metrics, trace bar accent, and technologies."
        action={
          <div className="flex items-center gap-3">
            <Link
              href="/admin/projects"
              className="px-3 py-1.5 text-xs border border-rule rounded-xs text-ink hover:bg-rule/40 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-1.5 rounded-xs bg-signal text-white text-xs font-medium hover:bg-signal/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        }
      />

      {validationError && (
        <div
          role="alert"
          className="p-4 rounded-xs border border-mark bg-mark/5 text-xs text-mark font-medium leading-relaxed"
        >
          {validationError}
        </div>
      )}

      {/* ── SECTION 1: CORE INFORMATION ── */}
      <div className="bg-paper border border-rule rounded-xs p-6 space-y-6">
        <h2 className="text-sm font-semibold tracking-tight text-ink uppercase border-b border-rule pb-2">
          General Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
              placeholder="Latency teardown, 40-seat support desk"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugManuallyEdited(true)
              }}
              className="w-full px-3 py-2 text-xs border border-rule rounded-xs bg-transparent font-mono focus:outline-hidden focus:border-signal"
              placeholder="latency-teardown-support-desk"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Client / Organization
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
              placeholder="Fintech Co"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Your Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
              placeholder="Forward Deployed AI Lead"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Publication Status *
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as 'draft' | 'published' | 'archived')
              }
              className="w-full px-3 py-2 text-xs border border-rule rounded-xs bg-paper focus:outline-hidden focus:border-signal"
            >
              <option value="draft">Draft (Private)</option>
              <option value="published">Published (Visible live)</option>
              <option value="archived">Archived (In archive page)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">
            One-line Summary / Hook *
          </label>
          <input
            type="text"
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
            placeholder="Halved response time across 40 customer support agents by deploying local quantized models."
          />
        </div>

        <div className="flex flex-wrap gap-6 pt-2">
          <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="accent-signal"
            />
            <span className="text-ink font-medium">Featured on homepage work section</span>
          </label>

          <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showInDesign}
              onChange={(e) => setShowInDesign(e.target.checked)}
              className="accent-signal"
            />
            <span className="text-ink font-medium">Include in Design gallery</span>
          </label>
        </div>
      </div>

      {/* ── SECTION 2: ACCENT COLOR & TIMELINE ── */}
      <div className="bg-paper border border-rule rounded-xs p-6 space-y-6">
        <h2 className="text-sm font-semibold tracking-tight text-ink uppercase border-b border-rule pb-2">
          Visual Identity & Deployment Timeline
        </h2>

        {/* Accent Swatch Picker (6 curated colors) */}
        <AccentSwatchPicker
          value={accentColor}
          onChange={setAccentColor}
          label="Trace Bar Accent Colour *"
        />

        {/* Timeline */}
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
                Active / Ongoing (Renders ◆ marker)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: REPEATABLE IMPACT METRICS ── */}
      <div className="bg-paper border border-rule rounded-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-rule pb-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-ink uppercase">
              Impact Metrics *
            </h2>
            <p className="text-xxs text-graphite mt-0.5">
              At least one metric required to publish. Select which metric serves as the headline.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddMetric}
            className="text-xs px-2.5 py-1 rounded-xs bg-rule/50 text-ink hover:bg-rule font-medium transition-colors cursor-pointer"
          >
            + Add Metric
          </button>
        </div>

        {metrics.length === 0 ? (
          <div className="p-4 border border-dashed border-mark/40 bg-mark/5 rounded-xs text-xs text-mark text-center">
            No metrics defined. Projects cannot be published without at least one metric.
          </div>
        ) : (
          <div className="space-y-3">
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-xs border border-rule bg-paper"
              >
                <div className="flex items-center gap-2 sm:w-12 shrink-0">
                  <input
                    type="radio"
                    name="headline_metric"
                    checked={m.is_headline}
                    onChange={() => handleMetricChange(idx, 'is_headline', true)}
                    className="accent-signal cursor-pointer"
                    title="Set as headline metric"
                  />
                  <span className="text-xxs text-graphite">Lead</span>
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    required
                    placeholder="Metric Label (e.g. Latency)"
                    value={m.label}
                    onChange={(e) =>
                      handleMetricChange(idx, 'label', e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                  />
                </div>

                <div className="w-24">
                  <input
                    type="text"
                    placeholder="Before (e.g. 4.2s)"
                    value={m.before || ''}
                    onChange={(e) =>
                      handleMetricChange(idx, 'before', e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                  />
                </div>

                <div className="w-24">
                  <input
                    type="text"
                    required
                    placeholder="After (e.g. 610ms)"
                    value={m.after}
                    onChange={(e) =>
                      handleMetricChange(idx, 'after', e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal font-medium text-ink"
                  />
                </div>

                <div className="w-20">
                  <input
                    type="text"
                    placeholder="Unit (ms, %)"
                    value={m.unit || ''}
                    onChange={(e) =>
                      handleMetricChange(idx, 'unit', e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveMetric(idx)}
                  className="text-mark hover:text-mark/80 text-xs px-2 py-1 transition-colors cursor-pointer self-end sm:self-center"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 4: CASE STUDY DETAILS & MARKDOWN BODY ── */}
      <div className="bg-paper border border-rule rounded-xs p-6 space-y-6">
        <h2 className="text-sm font-semibold tracking-tight text-ink uppercase border-b border-rule pb-2">
          Case Study Structure (Problem → Approach → Outcome)
        </h2>

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">
            The Problem
          </label>
          <textarea
            rows={3}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="w-full p-3 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal leading-relaxed"
            placeholder="Context, bottlenecks, and business stakes..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">
            The Approach
          </label>
          <textarea
            rows={3}
            value={approach}
            onChange={(e) => setApproach(e.target.value)}
            className="w-full p-3 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal leading-relaxed"
            placeholder="Architecture, trade-offs, and forward deployed execution..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">
            The Outcome
          </label>
          <textarea
            rows={3}
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            className="w-full p-3 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal leading-relaxed"
            placeholder="Measurable business impact, reliability, and deployment status..."
          />
        </div>

        {/* Markdown Body with Preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-ink">
              Extended Case Study Body (Markdown)
            </label>
            <div className="flex items-center gap-1 border border-rule rounded-xs p-0.5 bg-paper">
              <button
                type="button"
                onClick={() => setBodyTab('write')}
                className={`text-xxs px-2.5 py-0.5 rounded-xs transition-colors cursor-pointer ${
                  bodyTab === 'write' ? 'bg-signal text-white font-medium' : 'text-graphite'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setBodyTab('preview')}
                className={`text-xxs px-2.5 py-0.5 rounded-xs transition-colors cursor-pointer ${
                  bodyTab === 'preview' ? 'bg-signal text-white font-medium' : 'text-graphite'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {bodyTab === 'write' ? (
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3 text-xs font-mono border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal leading-relaxed"
              placeholder="## System Architecture&#10;&#10;Detailed narrative formatted in standard markdown..."
            />
          ) : (
            <div className="min-h-[12rem] p-4 border border-rule rounded-xs bg-paper font-prose text-body text-ink/90 whitespace-pre-wrap">
              {body || <span className="text-graphite italic text-xs">Nothing to preview.</span>}
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 5: TECH MULTI-SELECT ── */}
      <div className="bg-paper border border-rule rounded-xs p-6 space-y-4">
        <div className="border-b border-rule pb-2">
          <h2 className="text-sm font-semibold tracking-tight text-ink uppercase">
            Technologies & Tools
          </h2>
          <p className="text-xxs text-graphite mt-0.5">
            Select technologies used in this project.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {availableTech.map((t) => {
            const isSelected = selectedTechIds.includes(t.id)
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleToggleTech(t.id)}
                className={`text-xs px-3 py-1.5 rounded-xs border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-signal bg-signal/10 text-signal font-medium'
                    : 'border-rule bg-paper text-graphite hover:text-ink hover:border-rule-strong'
                }`}
              >
                {t.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── SECTION 6: REPEATABLE LINKS ── */}
      <div className="bg-paper border border-rule rounded-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-rule pb-2">
          <h2 className="text-sm font-semibold tracking-tight text-ink uppercase">
            Project Links
          </h2>
          <button
            type="button"
            onClick={handleAddLink}
            className="text-xs px-2.5 py-1 rounded-xs bg-rule/50 text-ink hover:bg-rule font-medium transition-colors cursor-pointer"
          >
            + Add Link
          </button>
        </div>

        {links.length === 0 ? (
          <p className="text-xs text-graphite italic py-2 text-center">
            No external links attached.
          </p>
        ) : (
          <div className="space-y-3">
            {links.map((link, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xs border border-rule bg-paper"
              >
                <div className="w-1/3">
                  <input
                    type="text"
                    placeholder="Label (e.g. Live demo)"
                    value={link.label}
                    onChange={(e) =>
                      handleLinkChange(idx, 'label', e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) =>
                      handleLinkChange(idx, 'url', e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLink(idx)}
                  className="text-mark hover:text-mark/80 text-xs px-2 py-1 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 7: SEO ── */}
      <div className="bg-paper border border-rule rounded-xs p-6 space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-ink uppercase border-b border-rule pb-2">
          SEO & OpenGraph
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              SEO Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
              placeholder="Latency Teardown — Manish Kumawat"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              SEO Description
            </label>
            <input
              type="text"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
              placeholder="Reduced agent wait times from 4.2s to 610ms."
            />
          </div>
        </div>
      </div>
    </form>
  )
}
