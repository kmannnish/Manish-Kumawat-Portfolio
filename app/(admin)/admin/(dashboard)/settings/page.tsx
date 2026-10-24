'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { useToast } from '@/components/ui/Toast'
import { updateSiteSettings } from '@/app/actions/admin'
import type { Database } from '@/lib/database.types'

type SiteSettingsRow = Database['public']['Tables']['site_settings']['Row']
type DocumentRow = Database['public']['Tables']['documents']['Row']

interface SocialLink {
  label: string
  url: string
  icon?: string
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [documents, setDocuments] = useState<DocumentRow[]>([])

  // Form State
  const [ownerName, setOwnerName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [currently, setCurrently] = useState('')
  const [location, setLocation] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [resumeDocumentId, setResumeDocumentId] = useState<string>('')
  const [ogImageId, setOgImageId] = useState<string | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])

  const toast = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      setLoading(true)

      // Fetch site_settings
      const { data: settings, error: settingsError } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (settingsError) {
        toast.error('Failed to load site settings.')
      } else if (settings) {
        setOwnerName(settings.owner_name || '')
        setRoleTitle(settings.role_title || '')
        setTagline(settings.tagline || '')
        setCurrently(settings.currently || '')
        setLocation(settings.location || '')
        setContactEmail(settings.contact_email || '')
        setSeoTitle(settings.seo_title || '')
        setSeoDescription(settings.seo_description || '')
        setResumeDocumentId(settings.resume_document_id || '')
        setOgImageId(settings.og_image_id || null)

        if (Array.isArray(settings.social_links)) {
          setSocialLinks(settings.social_links as unknown as SocialLink[])
        } else {
          setSocialLinks([])
        }
      }

      // Fetch documents for the résumé picker
      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (docs) {
        setDocuments(docs)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  function handleAddSocialLink() {
    setSocialLinks((prev) => [
      ...prev,
      { label: 'GitHub', url: 'https://github.com/', icon: 'github' },
    ])
  }

  function handleRemoveSocialLink(index: number) {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSocialLinkChange(
    index: number,
    field: keyof SocialLink,
    value: string
  ) {
    setSocialLinks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const result = await updateSiteSettings({
      owner_name: ownerName.trim(),
      role_title: roleTitle.trim(),
      tagline: tagline.trim(),
      currently: currently.trim(),
      location: location.trim() || null,
      contact_email: contactEmail.trim() || null,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      og_image_id: ogImageId || null,
      resume_document_id: resumeDocumentId || null,
      social_links: socialLinks as any,
    })

    if (result.success) {
      toast.success('Site settings saved and revalidated.')
    } else {
      toast.error(result.error || 'Failed to save site settings.')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-graphite font-display">
        Loading site settings...
      </div>
    )
  }

  return (
    <div className="space-y-8 font-display pb-16">
      <AdminHeader
        title="Site Settings"
        description="Core identity, current activity, SEO metadata, and global contact coordinates."
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identity & Role */}
        <section className="bg-paper border border-rule rounded-xs p-6 space-y-6">
          <h2 className="text-sm font-semibold tracking-tight text-ink uppercase border-b border-rule pb-2">
            Identity & Persona
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="owner_name"
                className="block text-xs font-medium text-ink mb-1.5"
              >
                Full Name
              </label>
              <input
                id="owner_name"
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 text-xs text-ink bg-transparent border border-rule rounded-xs focus:outline-hidden focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
                placeholder="Manish Kumawat"
              />
            </div>

            <div>
              <label
                htmlFor="role_title"
                className="block text-xs font-medium text-ink mb-1.5"
              >
                Role Title
              </label>
              <input
                id="role_title"
                type="text"
                required
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs text-ink bg-transparent border border-rule rounded-xs focus:outline-hidden focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
                placeholder="Forward Deployed AI Engineer & Designer"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="tagline"
              className="block text-xs font-medium text-ink mb-1.5"
            >
              Tagline (Hero Statement)
            </label>
            <input
              id="tagline"
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 text-xs text-ink bg-transparent border border-rule rounded-xs focus:outline-hidden focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              placeholder="I build tools that solve real problems and design things people remember."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="location"
                className="block text-xs font-medium text-ink mb-1.5"
              >
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs text-ink bg-transparent border border-rule rounded-xs focus:outline-hidden focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
                placeholder="India"
              />
            </div>

            <div>
              <label
                htmlFor="contact_email"
                className="block text-xs font-medium text-ink mb-1.5"
              >
                Contact Email
              </label>
              <input
                id="contact_email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs text-ink bg-transparent border border-rule rounded-xs focus:outline-hidden focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
                placeholder="mannnishkumawat@gmail.com"
              />
            </div>
          </div>
        </section>

        {/* Currently Focus */}
        <section className="bg-paper border border-rule rounded-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-rule pb-2">
            <h2 className="text-sm font-semibold tracking-tight text-ink uppercase">
              Current Focus ("Currently")
            </h2>
            <span className="text-xxs text-graphite">
              Renders live in the top bar and status badge
            </span>
          </div>

          <div>
            <label
              htmlFor="currently"
              className="block text-xs font-medium text-ink mb-1.5"
            >
              What are you actively working on right now?
            </label>
            <textarea
              id="currently"
              rows={3}
              required
              value={currently}
              onChange={(e) => setCurrently(e.target.value)}
              className="w-full p-3 text-xs text-ink bg-transparent border border-rule rounded-xs focus:outline-hidden focus:border-signal focus:ring-1 focus:ring-signal transition-colors leading-relaxed"
              placeholder="Building AI-powered automation tools and shipping live products for clients..."
            />
          </div>
        </section>

        {/* Résumé Document Picker */}
        <section className="bg-paper border border-rule rounded-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-rule pb-2">
            <h2 className="text-sm font-semibold tracking-tight text-ink uppercase">
              Résumé Document
            </h2>
            <span className="text-xxs text-graphite">
              Referenced by the About section and download CTA
            </span>
          </div>

          <div>
            <label
              htmlFor="resume_picker"
              className="block text-xs font-medium text-ink mb-1.5"
            >
              Select linked document
            </label>
            <select
              id="resume_picker"
              value={resumeDocumentId}
              onChange={(e) => setResumeDocumentId(e.target.value)}
              className="w-full px-3 py-2 text-xs text-ink bg-paper border border-rule rounded-xs focus:outline-hidden focus:border-signal transition-colors"
            >
              <option value="">Default static file (/Manish_Resume.pdf)</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.label} {doc.version ? `(v${doc.version})` : ''} — {doc.path}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xxs text-graphite">
              You can manage uploaded PDF files in the Media & Files library (Session 13).
            </p>
          </div>
        </section>

        {/* Social Links Repeatable List */}
        <section className="bg-paper border border-rule rounded-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-rule pb-2">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-ink uppercase">
                Social Profiles & External Links
              </h2>
              <p className="text-xxs text-graphite mt-0.5">
                Renders in the footer, contact section, and index rail
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSocialLink}
              className="text-xs px-2.5 py-1 rounded-xs bg-rule/50 text-ink hover:bg-rule font-medium transition-colors cursor-pointer"
            >
              + Add Link
            </button>
          </div>

          {socialLinks.length === 0 ? (
            <p className="text-xs text-graphite italic py-4 text-center">
              No social links configured yet.
            </p>
          ) : (
            <div className="space-y-3">
              {socialLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-xs border border-rule bg-paper"
                >
                  <div className="w-full sm:w-1/4">
                    <input
                      type="text"
                      placeholder="Label (e.g. GitHub)"
                      value={link.label}
                      onChange={(e) =>
                        handleSocialLinkChange(idx, 'label', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                    />
                  </div>

                  <div className="w-full sm:flex-1">
                    <input
                      type="url"
                      placeholder="https://github.com/manishk"
                      value={link.url}
                      onChange={(e) =>
                        handleSocialLinkChange(idx, 'url', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-rule rounded-xs bg-transparent focus:outline-hidden focus:border-signal"
                    />
                  </div>

                  <div className="w-full sm:w-1/4">
                    <select
                      value={link.icon || 'link'}
                      onChange={(e) =>
                        handleSocialLinkChange(idx, 'icon', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-rule rounded-xs bg-paper focus:outline-hidden focus:border-signal"
                    >
                      <option value="github">GitHub</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">X / Twitter</option>
                      <option value="email">Email</option>
                      <option value="link">Generic Link</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSocialLink(idx)}
                    className="text-mark hover:text-mark/80 text-xs px-2 py-1 transition-colors cursor-pointer self-end sm:self-center"
                    title="Remove social link"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SEO & Meta Fields */}
        <section className="bg-paper border border-rule rounded-xs p-6 space-y-4">
          <h2 className="text-sm font-semibold tracking-tight text-ink uppercase border-b border-rule pb-2">
            Search Engine Optimization (SEO)
          </h2>

          <div>
            <label
              htmlFor="seo_title"
              className="block text-xs font-medium text-ink mb-1.5"
            >
              SEO Meta Title
            </label>
            <input
              id="seo_title"
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs text-ink bg-transparent border border-rule rounded-xs focus:outline-hidden focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              placeholder="Manish Kumawat — Forward Deployed AI Engineer & Designer"
            />
          </div>

          <div>
            <label
              htmlFor="seo_description"
              className="block text-xs font-medium text-ink mb-1.5"
            >
              SEO Meta Description
            </label>
            <textarea
              id="seo_description"
              rows={2}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full p-3 text-xs text-ink bg-transparent border border-rule rounded-xs focus:outline-hidden focus:border-signal focus:ring-1 focus:ring-signal transition-colors leading-relaxed"
              placeholder="I solve business problems with AI, code, and design. Live projects across industries..."
            />
          </div>

          <div className="pt-2">
            <MediaPicker
              value={ogImageId}
              onChange={setOgImageId}
              label="OpenGraph Social Share Image (1200 × 630 recommended)"
            />
          </div>
        </section>

        {/* Save Bar */}
        <div className="sticky bottom-6 z-20 flex items-center justify-between bg-paper/95 backdrop-blur-xs p-4 rounded-xs border border-rule shadow-md">
          <span className="text-xs text-graphite">
            Saving immediately updates site settings and revalidates page caches.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xs bg-signal text-white text-xs font-medium hover:bg-signal/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving changes...' : 'Save Site Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
