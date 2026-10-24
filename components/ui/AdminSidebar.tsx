'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ADMIN_NAV = [
  { label: 'Overview', href: '/admin', shortLabel: 'Home' },
  { label: 'Site Settings', href: '/admin/settings', shortLabel: 'Settings' },
  { label: 'Copy & Content', href: '/admin/copy', shortLabel: 'Copy' },
  { label: 'Sections & Nav', href: '/admin/sections', shortLabel: 'Sections' },
  { label: 'Projects', href: '/admin/projects', shortLabel: 'Projects' },
  { label: 'Experience', href: '/admin/experience', shortLabel: 'Experience' },
  { label: 'Media & Files', href: '/admin/media', shortLabel: 'Media' },
  { label: 'Inquiries Inbox', href: '/admin/inbox', shortLabel: 'Inbox' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  function isItemActive(href: string) {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* ── MOBILE TOP BAR (< md) ── */}
      <header className="md:hidden sticky top-0 z-40 bg-paper/95 backdrop-blur-xs border-b border-rule font-display">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-ink font-medium tracking-tight text-sm hover:text-signal transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-signal" />
            <span>Admin Console</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xxs text-graphite hover:text-ink px-2 py-1 rounded-xs border border-rule transition-colors"
            >
              ↗ Public
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle admin menu"
              className="px-2.5 py-1 text-xs border border-rule rounded-xs text-ink hover:bg-rule/40 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <span>{mobileMenuOpen ? '✕ Close' : '☰ Menu'}</span>
            </button>
          </div>
        </div>

        {/* Horizontal quick tabs strip on mobile */}
        <div className="overflow-x-auto border-t border-rule/60 px-2 py-1.5 flex items-center gap-1.5 scrollbar-none">
          {ADMIN_NAV.map((item) => {
            const active = isItemActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 px-2.5 py-1 rounded-xs text-xs font-medium transition-colors ${
                  active
                    ? 'bg-signal text-white'
                    : 'text-graphite hover:text-ink hover:bg-rule/40'
                }`}
              >
                {item.shortLabel || item.label}
              </Link>
            )
          })}
        </div>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <div className="p-4 border-t border-rule bg-paper space-y-4 shadow-lg animate-in fade-in duration-150">
            <nav aria-label="Mobile Admin Navigation">
              <ul className="space-y-1">
                {ADMIN_NAV.map((item) => {
                  const active = isItemActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xs text-xs font-medium transition-colors ${
                          active
                            ? 'bg-signal/10 text-signal border-l-2 border-signal font-semibold'
                            : 'text-ink/80 hover:bg-rule/30 hover:text-ink'
                        }`}
                      >
                        <span>{item.label}</span>
                        {active && <span className="text-xxs text-signal">●</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="pt-3 border-t border-rule flex items-center justify-between">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-graphite hover:text-signal transition-colors"
              >
                ↗ View public site
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs font-medium text-mark hover:underline cursor-pointer"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── DESKTOP SIDEBAR (>= md) ── */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-rule bg-paper min-h-screen flex-col justify-between py-6 sticky top-0 h-screen font-display text-data">
        <div className="space-y-6 overflow-y-auto">
          {/* Brand / Title */}
          <div className="px-6">
            <Link
              href="/admin"
              className="group block font-medium text-ink tracking-tight text-base hover:text-signal transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-signal" />
                <span>Admin Console</span>
              </div>
              <span className="text-xs text-graphite block mt-0.5 group-hover:text-ink/80 transition-colors">
                Instrument CMS
              </span>
            </Link>
          </div>

          {/* Navigation list */}
          <nav aria-label="Admin Navigation" className="px-3">
            <ul className="space-y-1">
              {ADMIN_NAV.map((item) => {
                const isActive = isItemActive(item.href)

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xs text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-signal/10 text-signal border-l-2 border-signal font-semibold'
                          : 'text-ink/80 hover:bg-rule/30 hover:text-ink'
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.href === '/admin' && (
                        <span className="text-xxs px-1 py-0.2 rounded-xs bg-rule/50 text-graphite">
                          Home
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* Bottom actions: View live site & Sign out */}
        <div className="px-6 pt-6 border-t border-rule space-y-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-graphite hover:text-signal transition-colors block"
          >
            ↗ View public site
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-medium text-mark hover:underline transition-colors block cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
