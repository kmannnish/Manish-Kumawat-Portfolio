'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import {
  updateSubmissionStatus,
  updateSubmissionNotes,
  deleteSubmission,
} from '@/app/actions/inbox'
import type { Database } from '@/lib/database.types'

type SubmissionRow = Database['public']['Tables']['contact_submissions']['Row']
type SubmissionStatus = Database['public']['Enums']['submission_status']

export default function AdminInboxPage() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Notes editing state
  const [currentNotes, setCurrentNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<SubmissionRow | null>(null)

  const toast = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadSubmissions()
  }, [])

  async function loadSubmissions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to load contact submissions.')
    } else if (data) {
      setSubmissions(data)
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id)
        setCurrentNotes(data[0].notes || '')
      }
    }
    setLoading(false)
  }

  const selectedSubmission = useMemo(() => {
    return submissions.find((s) => s.id === selectedId) || null
  }, [submissions, selectedId])

  useEffect(() => {
    if (selectedSubmission) {
      setCurrentNotes(selectedSubmission.notes || '')
    }
  }, [selectedSubmission])

  // Unread count
  const unreadCount = useMemo(() => {
    return submissions.filter((s) => s.status === 'new').length
  }, [submissions])

  // Counts by status
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: submissions.length,
      new: 0,
      read: 0,
      replied: 0,
      archived: 0,
      spam: 0,
    }
    submissions.forEach((s) => {
      if (c[s.status] !== undefined) c[s.status]++
    })
    return c
  }, [submissions])

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchesStatus =
        activeFilter === 'all' || s.status === activeFilter
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        q === '' ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.company && s.company.toLowerCase().includes(q)) ||
        s.message.toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
  }, [submissions, activeFilter, searchQuery])

  // ── Actions ────────────────────────────────────────────────────────────────

  async function handleStatusChange(id: string, newStatus: SubmissionStatus) {
    const res = await updateSubmissionStatus(id, newStatus)
    if (res.success) {
      toast.success(`Marked as ${newStatus}.`)
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: newStatus,
                replied_at:
                  newStatus === 'replied' ? new Date().toISOString() : s.replied_at,
              }
            : s
        )
      )
    } else {
      toast.error(res.error || 'Failed to update status.')
    }
  }

  async function handleSaveNotes() {
    if (!selectedSubmission) return
    setSavingNotes(true)

    const res = await updateSubmissionNotes(selectedSubmission.id, currentNotes.trim())
    if (res.success) {
      toast.success('Internal notes saved.')
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === selectedSubmission.id ? { ...s, notes: currentNotes.trim() } : s
        )
      )
    } else {
      toast.error(res.error || 'Failed to save notes.')
    }
    setSavingNotes(false)
  }

  async function handleConfirmDelete() {
    if (!itemToDelete) return

    const res = await deleteSubmission(itemToDelete.id)
    if (res.success) {
      toast.success('Inquiry permanently deleted.')
      const remaining = submissions.filter((s) => s.id !== itemToDelete.id)
      setSubmissions(remaining)
      if (selectedId === itemToDelete.id) {
        setSelectedId(remaining.length > 0 ? remaining[0].id : null)
      }
    } else {
      toast.error(res.error || 'Failed to delete inquiry.')
    }
    setItemToDelete(null)
  }

  function handleExportCsv() {
    if (submissions.length === 0) {
      toast.info('No submissions to export.')
      return
    }

    const headers = [
      'ID',
      'Date',
      'Name',
      'Email',
      'Company',
      'Phone',
      'Status',
      'Message',
      'Notes',
    ]

    const rows = submissions.map((s) => [
      s.id,
      s.created_at,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.company || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      s.status,
      `"${(s.message || '').replace(/"/g, '""')}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `submissions-export-${new Date().toISOString().split('T')[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Exported inquiries to CSV.')
  }

  return (
    <div className="space-y-6 font-display pb-20">
      <AdminHeader
        title="Submissions Inbox"
        description="Prospective client inquiries received through the public contact form."
        action={
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-signal/15 text-signal text-xs font-semibold">
                {unreadCount} unread
              </span>
            )}
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 rounded-xs border border-rule text-xs font-medium text-ink hover:bg-rule/40 transition-colors cursor-pointer"
            >
              ↓ Export CSV
            </button>
          </div>
        }
      />

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-rule pb-4">
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'new', 'read', 'replied', 'archived', 'spam'] as const).map(
            (tab) => {
              const count = counts[tab] || 0
              const isSelected = activeFilter === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className={`text-xs px-3 py-1.5 rounded-xs transition-colors cursor-pointer capitalize flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-signal text-white font-medium'
                      : 'bg-rule/40 text-graphite hover:text-ink hover:bg-rule/70'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`text-xxs px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-rule/60 text-ink'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            }
          )}
        </div>

        <div className="max-w-xs w-full">
          <input
            type="search"
            placeholder="Search sender, company, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs px-3 py-1.5 bg-paper border border-rule rounded-xs text-ink placeholder:text-graphite/60 focus:outline-hidden focus:border-signal"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-graphite font-display">
          Loading inquiries...
        </div>
      ) : submissions.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-rule rounded-xs space-y-2">
          <h3 className="text-sm font-medium text-ink">Inbox zero</h3>
          <p className="text-xs text-graphite max-w-sm mx-auto">
            All client inquiries have been processed. Share your portfolio link to invite new forward-deployed engagements.
          </p>
        </div>
      ) : (
        /* ── MASTER-DETAIL SPLIT PANE ── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Submissions List */}
          <div className="lg:col-span-5 space-y-2 max-h-[75vh] overflow-y-auto pr-1">
            {filteredSubmissions.length === 0 ? (
              <div className="py-12 text-center text-xs text-graphite italic border border-dashed border-rule rounded-xs">
                No inquiries match this filter.
              </div>
            ) : (
              filteredSubmissions.map((sub) => {
                const isSelected = sub.id === selectedId
                const isNew = sub.status === 'new'
                const formattedDate = new Date(sub.created_at).toLocaleDateString(
                  'en-US',
                  { month: 'short', day: 'numeric' }
                )

                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(sub.id)
                      // If selecting an unread message, automatically mark as read
                      if (sub.status === 'new') {
                        handleStatusChange(sub.id, 'read')
                      }
                    }}
                    className={`w-full text-left p-3.5 rounded-xs border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-signal bg-signal/5 ring-1 ring-signal/30'
                        : 'border-rule hover:border-rule-strong bg-paper'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {isNew && (
                          <span
                            className="w-2 h-2 rounded-full bg-signal shrink-0"
                            title="Unread inquiry"
                          />
                        )}
                        <span
                          className={`text-xs truncate ${
                            isNew ? 'font-semibold text-ink' : 'font-medium text-ink/90'
                          }`}
                        >
                          {sub.name}
                        </span>
                      </div>
                      <span className="text-xxs text-graphite shrink-0 font-mono">
                        {formattedDate}
                      </span>
                    </div>

                    {sub.company && (
                      <p className="text-xxs text-graphite truncate mb-1">
                        {sub.company}
                      </p>
                    )}

                    <p className="text-xs text-graphite/80 line-clamp-2 leading-relaxed">
                      {sub.message}
                    </p>

                    <div className="mt-2 pt-2 border-t border-rule/50 flex items-center justify-between text-xxs">
                      <span
                        className={`capitalize px-1.5 py-0.5 rounded-xs font-mono ${
                          sub.status === 'new'
                            ? 'bg-signal/15 text-signal font-semibold'
                            : sub.status === 'replied'
                            ? 'bg-ink/10 text-ink font-medium'
                            : sub.status === 'spam'
                            ? 'bg-mark/10 text-mark'
                            : 'bg-rule/40 text-graphite'
                        }`}
                      >
                        {sub.status}
                      </span>
                      {sub.notes && (
                        <span className="text-graphite italic">Has notes</span>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Right Column: Selected Inquiry Detail View */}
          <div className="lg:col-span-7 bg-paper border border-rule rounded-xs p-6 space-y-6">
            {selectedSubmission ? (
              <>
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-rule pb-5">
                  <div>
                    <h2 className="text-lg font-medium text-ink">
                      {selectedSubmission.name}
                    </h2>
                    <div className="text-xs text-graphite mt-1 space-y-0.5">
                      <p>
                        Email:{' '}
                        <a
                          href={`mailto:${selectedSubmission.email}`}
                          className="text-signal hover:underline"
                        >
                          {selectedSubmission.email}
                        </a>
                      </p>
                      {selectedSubmission.company && (
                        <p>Company: <strong className="text-ink font-medium">{selectedSubmission.company}</strong></p>
                      )}
                      {selectedSubmission.phone && (
                        <p>Phone: {selectedSubmission.phone}</p>
                      )}
                      <p className="text-xxs font-mono text-graphite/70 pt-1">
                        Received:{' '}
                        {new Date(selectedSubmission.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status Controls */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Mailto Reply Action */}
                    <a
                      href={`mailto:${encodeURIComponent(
                        selectedSubmission.email
                      )}?subject=${encodeURIComponent(
                        'Re: Inquiry — Manish Kumawat'
                      )}&body=${encodeURIComponent(
                        `Hi ${selectedSubmission.name},\n\nThank you for reaching out regarding your project. I reviewed your message and would love to discuss further.\n\nBest regards,\nManish Kumawat\nForward Deployed AI Engineer & Designer`
                      )}`}
                      onClick={() =>
                        handleStatusChange(selectedSubmission.id, 'replied')
                      }
                      className="px-4 py-2 rounded-xs bg-ink text-paper text-xs font-medium hover:bg-ink/90 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>✉ Compose Reply</span>
                    </a>

                    <div className="flex items-center gap-1 pt-1">
                      {selectedSubmission.status !== 'read' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(selectedSubmission.id, 'read')
                          }
                          className="text-xxs px-2 py-1 border border-rule rounded-xs text-graphite hover:text-ink hover:bg-rule/40 transition-colors"
                        >
                          Mark Read
                        </button>
                      )}
                      {selectedSubmission.status !== 'replied' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(selectedSubmission.id, 'replied')
                          }
                          className="text-xxs px-2 py-1 border border-rule rounded-xs text-graphite hover:text-ink hover:bg-rule/40 transition-colors"
                        >
                          Mark Replied
                        </button>
                      )}
                      {selectedSubmission.status !== 'archived' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(selectedSubmission.id, 'archived')
                          }
                          className="text-xxs px-2 py-1 border border-rule rounded-xs text-graphite hover:text-ink hover:bg-rule/40 transition-colors"
                        >
                          Archive
                        </button>
                      )}
                      {selectedSubmission.status !== 'spam' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(selectedSubmission.id, 'spam')
                          }
                          className="text-xxs px-2 py-1 border border-rule rounded-xs text-mark hover:bg-mark/10 transition-colors"
                        >
                          Spam
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setItemToDelete(selectedSubmission)}
                        className="text-xxs px-2 py-1 text-mark hover:underline cursor-pointer ml-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inquiry Message */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-graphite">
                    Message
                  </h3>
                  <div className="p-4 rounded-xs border border-rule bg-paper/60 text-xs font-sans text-ink leading-relaxed whitespace-pre-wrap select-text">
                    {selectedSubmission.message}
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="space-y-2 pt-4 border-t border-rule">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-graphite">
                      Internal Admin Notes
                    </h3>
                    <span className="text-xxs text-graphite">
                      Private to admin team
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={currentNotes}
                    onChange={(e) => setCurrentNotes(e.target.value)}
                    placeholder="Add follow-up notes, budget estimates, contract status..."
                    className="w-full p-3 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={savingNotes}
                      onClick={handleSaveNotes}
                      className="px-3.5 py-1.5 rounded-xs bg-signal text-white text-xs font-medium hover:bg-signal/90 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {savingNotes ? 'Saving Notes...' : 'Save Notes'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-xs text-graphite italic">
                Select an inquiry from the list to view full details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title={`Delete inquiry from "${itemToDelete?.name}"?`}
        description="This action cannot be undone. The inquiry and all attached notes will be permanently removed."
        confirmLabel="Permanently Delete"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  )
}
