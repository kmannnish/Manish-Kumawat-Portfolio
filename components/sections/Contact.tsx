'use client'

import { useState, useEffect } from 'react'
import type { SiteSettings } from '@/lib/queries'
import { t, type CopyMap } from '@/lib/copy'

interface ContactProps {
  copy: CopyMap
  settings: SiteSettings | null
}

export function Contact({ copy, settings }: ContactProps) {
  const [renderedAt, setRenderedAt] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
    hp_website: '',
  })

  useEffect(() => {
    setRenderedAt(Date.now())
  }, [])

  const nameLabel = t(copy, 'contact.form.name.label', 'Your name')
  const namePlaceholder = t(copy, 'contact.form.name.placeholder', 'Priya Sharma')
  const companyLabel = t(copy, 'contact.form.company.label', 'Company')
  const companyPlaceholder = t(copy, 'contact.form.company.placeholder', 'Acme Corp')
  const emailLabel = t(copy, 'contact.form.email.label', 'Email')
  const emailPlaceholder = t(copy, 'contact.form.email.placeholder', 'priya@acme.com')
  const messageLabel = t(copy, 'contact.form.message.label', 'Message')
  const messagePlaceholder = t(
    copy,
    'contact.form.message.placeholder',
    'Tell me about your project…'
  )
  const submitButtonLabel = t(copy, 'contact.form.submit', 'Send message')
  const successText = t(
    copy,
    'contact.form.success',
    "Message sent. I'll reply within a day or two."
  )
  const genericErrorText = t(
    copy,
    'contact.form.error',
    'Something went wrong. Try again or email directly.'
  )

  const directEmail = settings?.contact_email
  const socialLinks = Array.isArray(settings?.social_links)
    ? (settings?.social_links as any[])
    : []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setFieldErrors({})

    try {
      const payload = {
        ...formData,
        form_rendered_at: renderedAt,
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        if (data.errors) {
          setFieldErrors(data.errors)
        } else {
          setErrorMessage(data.message || genericErrorText)
        }
        setIsSubmitting(false)
        return
      }

      setSuccessMessage(data.message || successText)
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        message: '',
        hp_website: '',
      })
    } catch {
      setErrorMessage(genericErrorText)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" aria-label="Contact" className="py-12 lg:py-16 text-left">
      <div className="max-w-prose space-y-6">
        <div>
          <h2 className="text-h2 font-medium text-ink tracking-tight mb-3">
            Contact
          </h2>
          <p className="font-prose text-body text-ink/85 leading-relaxed">
            Have a project in mind or an engineering challenge to solve? Send a
            message below{directEmail ? ` or reach out directly at ${directEmail}` : ''}.
          </p>
        </div>

        {/* Success State */}
        {successMessage ? (
          <div
            role="status"
            className="rounded-xs border border-rule-strong/40 bg-rule/30 p-6 space-y-2 text-ink"
          >
            <h3 className="text-base font-medium text-ink font-display">
              {successMessage}
            </h3>
            <p className="text-xs text-graphite font-display">
              You can also find me on{' '}
              {socialLinks.map((s, idx) => (
                <span key={s.url}>
                  {idx > 0 && ', '}
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-signal hover:underline"
                  >
                    {s.label}
                  </a>
                </span>
              ))}
              .
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-6 font-display" noValidate>
            {/* Honeypot field (hidden from genuine users, filled by bots) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="hp_website">Website</label>
              <input
                id="hp_website"
                type="text"
                name="hp_website"
                tabIndex={-1}
                autoComplete="off"
                value={formData.hp_website}
                onChange={(e) =>
                  setFormData({ ...formData, hp_website: e.target.value })
                }
              />
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div
                role="alert"
                className="rounded-xs border border-mark/40 bg-mark/5 p-4 text-xs text-ink font-medium"
              >
                {errorMessage}
              </div>
            )}

            {/* Name & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs font-medium text-ink">
                  {nameLabel} <span className="text-mark">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder={namePlaceholder}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-xs border border-rule bg-paper px-3 py-2 text-data text-ink placeholder:text-graphite/60 focus:border-signal focus:outline-hidden focus:ring-1 focus:ring-signal"
                />
                {fieldErrors.name && (
                  <p className="text-xs text-mark">{fieldErrors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="company" className="block text-xs font-medium text-ink">
                  {companyLabel}
                </label>
                <input
                  id="company"
                  type="text"
                  placeholder={companyPlaceholder}
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  className="w-full rounded-xs border border-rule bg-paper px-3 py-2 text-data text-ink placeholder:text-graphite/60 focus:border-signal focus:outline-hidden focus:ring-1 focus:ring-signal"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-medium text-ink">
                  {emailLabel} <span className="text-mark">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder={emailPlaceholder}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-xs border border-rule bg-paper px-3 py-2 text-data text-ink placeholder:text-graphite/60 focus:border-signal focus:outline-hidden focus:ring-1 focus:ring-signal"
                />
                {fieldErrors.email && (
                  <p className="text-xs text-mark">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-xs font-medium text-ink">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full rounded-xs border border-rule bg-paper px-3 py-2 text-data text-ink placeholder:text-graphite/60 focus:border-signal focus:outline-hidden focus:ring-1 focus:ring-signal"
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label htmlFor="message" className="block text-xs font-medium text-ink">
                {messageLabel} <span className="text-mark">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={5}
                placeholder={messagePlaceholder}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full rounded-xs border border-rule bg-paper px-3 py-2 text-data text-ink placeholder:text-graphite/60 focus:border-signal focus:outline-hidden focus:ring-1 focus:ring-signal"
              />
              {fieldErrors.message && (
                <p className="text-xs text-mark">{fieldErrors.message}</p>
              )}
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xs bg-ink px-6 py-2.5 text-data font-medium text-paper hover:bg-signal transition-colors focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-hidden disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Sending…' : submitButtonLabel}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
