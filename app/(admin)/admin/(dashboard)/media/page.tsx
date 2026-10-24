'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import {
  checkMediaReferences,
  saveMediaRecord,
  deleteMediaRecord,
  saveDocumentRecord,
  deleteDocumentRecord,
  type MediaReferences,
} from '@/app/actions/media'
import { validateImageFile, processImageFile } from '@/lib/media/processImage'
import type { Database } from '@/lib/database.types'

type MediaRow = Database['public']['Tables']['media']['Row']
type DocumentRow = Database['public']['Tables']['documents']['Row']

export default function AdminMediaPage() {
  const [activeTab, setActiveTab] = useState<'media' | 'documents'>('media')
  const [mediaItems, setMediaItems] = useState<MediaRow[]>([])
  const [documentItems, setDocumentItems] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Upload modal states
  const [uploading, setUploading] = useState(false)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [pendingImageMeta, setPendingImageMeta] = useState<{
    width: number
    height: number
    placeholder: string
    byteSize: number
    mimeType: string
  } | null>(null)
  const [imageAltText, setImageAltText] = useState('')
  const [imageCaption, setImageCaption] = useState('')
  const [imageKind, setImageKind] = useState<'image' | 'poster' | 'print' | 'stage' | 'mockup'>('image')

  // Document modal states
  const [pendingDocFile, setPendingDocFile] = useState<File | null>(null)
  const [docLabel, setDocLabel] = useState('')
  const [docVersion, setDocVersion] = useState('')

  // Replace file state
  const [replaceTargetMedia, setReplaceTargetMedia] = useState<MediaRow | null>(null)

  // Delete modal state
  const [mediaToDelete, setMediaToDelete] = useState<MediaRow | null>(null)
  const [deleteReferences, setDeleteReferences] = useState<MediaReferences | null>(null)
  const [isCheckingReferences, setIsCheckingReferences] = useState(false)
  const [docToDelete, setDocToDelete] = useState<DocumentRow | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const docInputRef = useRef<HTMLInputElement | null>(null)
  const replaceInputRef = useRef<HTMLInputElement | null>(null)

  const toast = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [mediaRes, docRes] = await Promise.all([
      supabase.from('media').select('*').order('created_at', { ascending: false }),
      supabase.from('documents').select('*').order('created_at', { ascending: false }),
    ])

    if (mediaRes.data) setMediaItems(mediaRes.data)
    if (docRes.data) setDocumentItems(docRes.data)
    setLoading(false)
  }

  function getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  // ── Image Upload Flow ──────────────────────────────────────────────────────

  async function handleImageFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file.')
      return
    }

    try {
      const meta = await processImageFile(file)
      setPendingImageFile(file)
      setPendingImageMeta(meta)
      setImageAltText('')
      setImageCaption('')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to process image.')
    }
  }

  async function handleSaveNewImage(e: React.FormEvent) {
    e.preventDefault()
    if (!pendingImageFile || !pendingImageMeta) return

    // Alt text is strictly required
    if (!imageAltText.trim()) {
      toast.error('Alt text is required before saving an image.')
      return
    }

    setUploading(true)

    try {
      const ext = pendingImageFile.name.split('.').pop() || 'jpg'
      const cleanName = pendingImageFile.name
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
      const storagePath = `${Date.now()}-${cleanName}.${ext}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(storagePath, pendingImageFile, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // Save to media table
      const res = await saveMediaRecord({
        bucket: 'media',
        path: storagePath,
        kind: imageKind,
        alt_text: imageAltText.trim(),
        caption: imageCaption.trim() || null,
        width: pendingImageMeta.width,
        height: pendingImageMeta.height,
        byte_size: pendingImageMeta.byteSize,
        mime_type: pendingImageMeta.mimeType,
        placeholder: pendingImageMeta.placeholder || null,
      })

      if (res.success) {
        toast.success('Image uploaded and catalogued successfully.')
        setPendingImageFile(null)
        setPendingImageMeta(null)
        loadData()
      } else {
        toast.error(res.error || 'Failed to save media metadata.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  // ── Replace Image Flow ─────────────────────────────────────────────────────

  async function handleReplaceFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !replaceTargetMedia) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file.')
      return
    }

    setUploading(true)
    try {
      const meta = await processImageFile(file)

      // Overwrite file at existing path
      const { error: uploadError } = await supabase.storage
        .from(replaceTargetMedia.bucket)
        .upload(replaceTargetMedia.path, file, {
          upsert: true,
        })

      if (uploadError) throw new Error(uploadError.message)

      // Update metadata row
      await saveMediaRecord({
        id: replaceTargetMedia.id,
        bucket: replaceTargetMedia.bucket,
        path: replaceTargetMedia.path,
        alt_text: replaceTargetMedia.alt_text,
        width: meta.width,
        height: meta.height,
        byte_size: meta.byteSize,
        mime_type: meta.mimeType,
        placeholder: meta.placeholder,
      })

      toast.success('File replaced successfully.')
      setReplaceTargetMedia(null)
      loadData()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to replace file.')
    } finally {
      setUploading(false)
    }
  }

  // ── Document Upload Flow ───────────────────────────────────────────────────

  async function handleDocFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPendingDocFile(file)
    setDocLabel(file.name.replace(/\.[^/.]+$/, ''))
    setDocVersion('')
  }

  async function handleSaveNewDocument(e: React.FormEvent) {
    e.preventDefault()
    if (!pendingDocFile) return

    if (!docLabel.trim()) {
      toast.error('Document label is required.')
      return
    }

    setUploading(true)

    try {
      const cleanName = pendingDocFile.name
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '-')
      const storagePath = `${Date.now()}-${cleanName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, pendingDocFile, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw new Error(uploadError.message)

      const res = await saveDocumentRecord({
        bucket: 'documents',
        path: storagePath,
        label: docLabel.trim(),
        version: docVersion.trim() || null,
        byte_size: pendingDocFile.size,
        mime_type: pendingDocFile.type || 'application/pdf',
      })

      if (res.success) {
        toast.success('Document uploaded successfully.')
        setPendingDocFile(null)
        loadData()
      } else {
        toast.error(res.error || 'Failed to save document metadata.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Document upload failed.')
    } finally {
      setUploading(false)
    }
  }

  // ── Delete Flows with Reference Checks ─────────────────────────────────────

  async function initiateDeleteMedia(item: MediaRow) {
    setMediaToDelete(item)
    setIsCheckingReferences(true)

    const check = await checkMediaReferences(item.id)
    setDeleteReferences(check.references)
    setIsCheckingReferences(false)
  }

  async function handleConfirmDeleteMedia() {
    if (!mediaToDelete) return

    const res = await deleteMediaRecord(mediaToDelete.id, mediaToDelete.path)
    if (res.success) {
      toast.success('Media permanently deleted.')
      setMediaItems((prev) => prev.filter((m) => m.id !== mediaToDelete.id))
    } else {
      toast.error(res.error || 'Failed to delete media.')
    }
    setMediaToDelete(null)
    setDeleteReferences(null)
  }

  async function handleConfirmDeleteDoc() {
    if (!docToDelete) return

    const res = await deleteDocumentRecord(docToDelete.id, docToDelete.path)
    if (res.success) {
      toast.success('Document deleted.')
      setDocumentItems((prev) => prev.filter((d) => d.id !== docToDelete.id))
    } else {
      toast.error(res.error || 'Failed to delete document.')
    }
    setDocToDelete(null)
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url)
    toast.info('Public URL copied to clipboard.')
  }

  // Filtered
  const filteredMedia = mediaItems.filter((m) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      m.path.toLowerCase().includes(q) ||
      m.alt_text.toLowerCase().includes(q) ||
      (m.caption && m.caption.toLowerCase().includes(q))
    )
  })

  const filteredDocs = documentItems.filter((d) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      d.label.toLowerCase().includes(q) ||
      d.path.toLowerCase().includes(q) ||
      (d.version && d.version.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-8 font-display pb-20">
      <AdminHeader
        title="Media & Documents Library"
        description="Central repository for portfolio assets, case study imagery, design graphics, and downloadable PDFs."
        action={
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileSelect}
              accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
              className="hidden"
            />
            <input
              type="file"
              ref={docInputRef}
              onChange={handleDocFileSelect}
              accept="application/pdf,.doc,.docx"
              className="hidden"
            />
            <input
              type="file"
              ref={replaceInputRef}
              onChange={handleReplaceFileSelect}
              accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
              className="hidden"
            />

            {activeTab === 'media' ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xs bg-signal text-white text-xs font-medium hover:bg-signal/90 transition-colors cursor-pointer"
              >
                + Upload Image
              </button>
            ) : (
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="px-4 py-2 rounded-xs bg-signal text-white text-xs font-medium hover:bg-signal/90 transition-colors cursor-pointer"
              >
                + Upload Document
              </button>
            )}
          </div>
        }
      />

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-rule pb-4">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`pb-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'media'
                ? 'border-signal text-signal font-semibold'
                : 'border-transparent text-graphite hover:text-ink'
            }`}
          >
            Media & Images ({mediaItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`pb-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'documents'
                ? 'border-signal text-signal font-semibold'
                : 'border-transparent text-graphite hover:text-ink'
            }`}
          >
            Documents & Résumés ({documentItems.length})
          </button>
        </div>

        <div className="max-w-xs w-full">
          <input
            type="search"
            placeholder={
              activeTab === 'media'
                ? 'Search alt text or filename...'
                : 'Search document label...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs px-3 py-1.5 bg-paper border border-rule rounded-xs text-ink placeholder:text-graphite/60 focus:outline-hidden focus:border-signal"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-graphite font-display">
          Loading library assets...
        </div>
      ) : activeTab === 'media' ? (
        /* ── MEDIA GRID TAB ── */
        filteredMedia.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-rule rounded-xs">
            <p className="text-xs text-graphite mb-3">No media files found.</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium text-signal hover:underline cursor-pointer"
            >
              Upload an image to get started →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((item) => {
              const publicUrl = getPublicUrl(item.bucket, item.path)
              const sizeInKb = item.byte_size
                ? (item.byte_size / 1024).toFixed(0) + ' KB'
                : null

              return (
                <div
                  key={item.id}
                  className="rounded-xs border border-rule bg-paper overflow-hidden flex flex-col justify-between group hover:border-rule-strong transition-colors"
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video w-full bg-rule/20 overflow-hidden flex items-center justify-center">
                    <img
                      src={publicUrl}
                      alt={item.alt_text}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-xs bg-ink/75 text-paper text-xxs font-mono backdrop-blur-xs uppercase">
                      {item.kind}
                    </span>
                  </div>

                  {/* Metadata body */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium text-ink line-clamp-2" title={item.alt_text}>
                        {item.alt_text || <span className="text-mark italic">No alt text</span>}
                      </p>
                      {item.caption && (
                        <p className="text-xxs text-graphite line-clamp-1 mt-0.5">
                          {item.caption}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-rule text-xxs text-graphite space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span>
                          {item.width && item.height
                            ? `${item.width} × ${item.height}`
                            : 'Vector'}
                        </span>
                        <span>{sizeInKb}</span>
                      </div>
                      <p className="font-mono text-xxs truncate text-graphite/70" title={item.path}>
                        {item.path}
                      </p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="px-4 py-2.5 border-t border-rule bg-rule/10 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(publicUrl)}
                      className="text-graphite hover:text-ink transition-colors cursor-pointer text-xxs font-medium"
                    >
                      Copy URL
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setReplaceTargetMedia(item)
                          replaceInputRef.current?.click()
                        }}
                        className="text-signal hover:underline transition-colors cursor-pointer text-xxs font-medium"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => initiateDeleteMedia(item)}
                        className="text-mark hover:underline transition-colors cursor-pointer text-xxs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* ── DOCUMENTS TAB ── */
        filteredDocs.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-rule rounded-xs">
            <p className="text-xs text-graphite mb-3">No documents uploaded yet.</p>
            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              className="text-xs font-medium text-signal hover:underline cursor-pointer"
            >
              Upload a document (PDF) →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc) => {
              const publicUrl = getPublicUrl(doc.bucket, doc.path)
              const sizeInKb = doc.byte_size
                ? (doc.byte_size / 1024).toFixed(0) + ' KB'
                : null

              return (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xs border border-rule bg-paper hover:border-rule-strong transition-colors gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-ink">
                        {doc.label}
                      </span>
                      {doc.version && (
                        <span className="text-xxs px-1.5 py-0.5 rounded-xs bg-rule/50 text-graphite font-mono">
                          v{doc.version}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xxs text-graphite mt-1 font-mono">
                      <span>{sizeInKb}</span>
                      <span className="truncate">{doc.path}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-ink hover:text-signal transition-colors"
                    >
                      ↗ Download
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(publicUrl)}
                      className="text-xs text-graphite hover:text-ink cursor-pointer"
                    >
                      Copy URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocToDelete(doc)}
                      className="text-xs font-medium text-mark hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* ── IMAGE UPLOAD & ALT TEXT MODAL ── */}
      {pendingImageFile && pendingImageMeta && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs font-display"
        >
          <div className="w-full max-w-lg rounded-xs border border-rule bg-paper p-6 shadow-md space-y-4">
            <h3 className="text-base font-medium text-ink">
              Upload Image & Define Alt Text
            </h3>

            <div className="flex gap-4 items-start p-3 bg-rule/20 rounded-xs">
              <div className="w-24 h-24 shrink-0 bg-paper rounded-xs overflow-hidden border border-rule flex items-center justify-center">
                <img
                  src={URL.createObjectURL(pendingImageFile)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xxs text-graphite space-y-1 font-mono">
                <p className="text-ink font-medium truncate font-display text-xs">
                  {pendingImageFile.name}
                </p>
                <p>Dimensions: {pendingImageMeta.width} × {pendingImageMeta.height}</p>
                <p>Size: {(pendingImageMeta.byteSize / 1024).toFixed(1)} KB</p>
                <p>Format: {pendingImageMeta.mimeType}</p>
              </div>
            </div>

            <form onSubmit={handleSaveNewImage} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Alt Text * (Strictly required for accessibility)
                </label>
                <textarea
                  rows={2}
                  required
                  autoFocus
                  placeholder="Describe the image content accurately for screen readers and search..."
                  value={imageAltText}
                  onChange={(e) => setImageAltText(e.target.value)}
                  className="w-full p-2.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Media Category
                  </label>
                  <select
                    value={imageKind}
                    onChange={(e: any) => setImageKind(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-rule rounded-xs bg-paper focus:outline-hidden focus:border-signal"
                  >
                    <option value="image">Standard Image</option>
                    <option value="poster">Poster Design</option>
                    <option value="print">Print Material</option>
                    <option value="stage">Stage / Presentation</option>
                    <option value="mockup">Product Mockup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Caption (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Short caption for design gallery"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => {
                    setPendingImageFile(null)
                    setPendingImageMeta(null)
                  }}
                  disabled={uploading}
                  className="rounded-xs border border-rule px-4 py-2 text-xs font-medium text-ink hover:bg-rule/40 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !imageAltText.trim()}
                  className="rounded-xs bg-signal text-white px-5 py-2 text-xs font-medium hover:bg-signal/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? 'Processing & Saving...' : 'Save Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DOCUMENT UPLOAD MODAL ── */}
      {pendingDocFile && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs font-display"
        >
          <div className="w-full max-w-md rounded-xs border border-rule bg-paper p-6 shadow-md space-y-4">
            <h3 className="text-base font-medium text-ink">Upload Document</h3>
            <p className="text-xs text-graphite font-mono">
              File: {pendingDocFile.name} ({(pendingDocFile.size / 1024).toFixed(0)} KB)
            </p>

            <form onSubmit={handleSaveNewDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Document Label *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Manish Kumawat — Résumé"
                  value={docLabel}
                  onChange={(e) => setDocLabel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Version Tag (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026.Q4"
                  value={docVersion}
                  onChange={(e) => setDocVersion(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setPendingDocFile(null)}
                  disabled={uploading}
                  className="rounded-xs border border-rule px-4 py-2 text-xs font-medium text-ink hover:bg-rule/40 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !docLabel.trim()}
                  className="rounded-xs bg-signal text-white px-5 py-2 text-xs font-medium hover:bg-signal/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? 'Uploading...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE MEDIA MODAL WITH REFERENCE WARNING ── */}
      {mediaToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs font-display"
        >
          <div className="w-full max-w-md rounded-xs border border-rule-strong bg-paper p-6 shadow-md space-y-4">
            <h3 className="text-base font-medium text-ink">
              Delete Media File?
            </h3>

            {isCheckingReferences ? (
              <p className="text-xs text-graphite py-2">
                Checking whether this media is referenced across projects, posts, and settings...
              </p>
            ) : deleteReferences &&
              (deleteReferences.projectMedia.length > 0 ||
                deleteReferences.coverProjects.length > 0 ||
                deleteReferences.isOgImage ||
                deleteReferences.tech.length > 0 ||
                deleteReferences.posts.length > 0 ||
                deleteReferences.testimonials.length > 0) ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xs border border-mark bg-mark/10 text-xs text-mark font-medium leading-relaxed">
                  ⚠️ Warning: This file is actively in use by the following entities:
                  <ul className="list-disc list-inside mt-2 text-ink space-y-1 font-normal">
                    {deleteReferences.coverProjects.map((p, idx) => (
                      <li key={idx}>Cover for Project: <strong>{p}</strong></li>
                    ))}
                    {deleteReferences.projectMedia.map((p, idx) => (
                      <li key={idx}>Project Gallery: <strong>{p}</strong></li>
                    ))}
                    {deleteReferences.isOgImage && (
                      <li>Primary OpenGraph / Social Share Image</li>
                    )}
                    {deleteReferences.tech.map((t, idx) => (
                      <li key={idx}>Tech Icon: <strong>{t}</strong></li>
                    ))}
                    {deleteReferences.posts.map((p, idx) => (
                      <li key={idx}>Blog Post: <strong>{p}</strong></li>
                    ))}
                    {deleteReferences.testimonials.map((t, idx) => (
                      <li key={idx}>Testimonial Author: <strong>{t}</strong></li>
                    ))}
                  </ul>
                </div>
                <p className="text-xxs text-graphite">
                  Deleting will permanently delete the file from storage and remove this row. Dependent records will lose their image references.
                </p>
              </div>
            ) : (
              <p className="text-xs text-graphite">
                This image is not currently referenced by any projects or settings. Deleting it will permanently remove it from storage.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-rule">
              <button
                type="button"
                onClick={() => {
                  setMediaToDelete(null)
                  setDeleteReferences(null)
                }}
                className="rounded-xs border border-rule px-4 py-2 text-xs font-medium text-ink hover:bg-rule/40 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMedia}
                className="rounded-xs bg-mark text-white px-4 py-2 text-xs font-medium hover:bg-mark/90 transition-colors cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE DOCUMENT MODAL ── */}
      <ConfirmDialog
        isOpen={Boolean(docToDelete)}
        title={`Delete document "${docToDelete?.label}"?`}
        description="This action cannot be undone. The document file will be permanently removed from storage."
        confirmLabel="Delete Document"
        isDestructive={true}
        onConfirm={handleConfirmDeleteDoc}
        onCancel={() => setDocToDelete(null)}
      />
    </div>
  )
}
