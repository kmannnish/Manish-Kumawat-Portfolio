'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { SiteSettings, NavItem } from '@/lib/queries'
import { t, type CopyMap } from '@/lib/copy'

interface TopBarProps {
  settings: SiteSettings | null
  copy: CopyMap
  navItems?: NavItem[]
}

const DEFAULT_NAV = [
  { id: 'work', label: 'Work', href: '/#work', is_external: false },
  { id: 'design', label: 'Design', href: '/design', is_external: false },
  { id: 'about', label: 'About', href: '/#about', is_external: false },
  { id: 'archive', label: 'Archive', href: '/archive', is_external: false },
  { id: 'contact', label: 'Contact', href: '/#contact', is_external: false },
]

export function TopBar({ settings, copy, navItems }: TopBarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeHash, setActiveHash] = useState('')

  const ownerName = settings?.owner_name || 'Manish Kumawat'
  const currently = settings?.currently || 'Forward Deployed AI & High-Craft Interfaces'
  const currentlyPrefix = t(copy, 'topbar.currently', 'Currently')

  const links = navItems && navItems.length > 0 ? navItems : DEFAULT_NAV

  // Track scroll progress and active section hash
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight > 0) {
        const progress = (window.scrollY / scrollHeight) * 100
        setScrollProgress(Math.min(100, Math.max(0, progress)))
      }

      // Check which section is in view if on home page
      if (pathname === '/') {
        const sectionIds = ['hero', 'trace', 'work', 'design', 'testimonials', 'about', 'contact']
        for (const id of sectionIds) {
          const el = document.getElementById(id)
          if (el) {
            const rect = el.getBoundingClientRect()
            if (rect.top <= 200 && rect.bottom >= 150) {
              setActiveHash(`#${id}`)
              break
            }
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const isLinkActive = (href: string) => {
    if (href === '/' && pathname === '/' && !activeHash) return true
    if (href.startsWith('/#')) {
      const hash = href.substring(1)
      return pathname === '/' && activeHash === hash
    }
    if (href === pathname) return true
    return false
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rule/70 bg-paper/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 text-data">
        {/* ── Left: Brand Identity with Live Status Pulse ── */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-medium tracking-tight text-ink hover:text-signal transition-colors"
          >
            <span className="text-sm sm:text-base font-semibold font-display tracking-tight">
              {ownerName}
            </span>
          </Link>

          {/* Live Availability Pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-800">
            <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-medium">Available</span>
          </div>
        </div>

        {/* ── Center: Sleek Horizontal Navigation (Desktop) ── */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-1">
          {links.map((item) => {
            const active = isLinkActive(item.href)
            return (
              <Link
                key={item.id || item.href}
                href={item.href}
                target={item.is_external ? '_blank' : undefined}
                rel={item.is_external ? 'noopener noreferrer' : undefined}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-150 ${
                  active
                    ? 'bg-ink text-paper shadow-xs font-semibold'
                    : 'text-graphite hover:text-ink hover:bg-rule/40'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* ── Right: Live Focus & Quick Contact Action ── */}
        <div className="flex items-center gap-3">
          {currently ? (
            <div className="hidden xl:flex items-center gap-1.5 max-w-xs truncate text-xs text-graphite font-display">
              <span className="text-graphite/80 font-normal">{currentlyPrefix}:</span>
              <span className="truncate font-medium text-ink">{currently}</span>
            </div>
          ) : null}

          <Link
            href="/#contact"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xs bg-signal text-white hover:bg-signal/90 transition-all shadow-xs cursor-pointer"
          >
            <span>Get in touch</span>
            <span className="text-[10px]">→</span>
          </Link>

          {/* ── Mobile Hamburger Toggle ── */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xs text-ink hover:bg-rule/40 transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Scroll Progress Line ── */}
      <div className="h-[2px] w-full bg-rule/40 overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-signal transition-[width] duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ── Mobile Dropdown Sheet ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-rule bg-paper/95 backdrop-blur-md px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            {links.map((item) => {
              const active = isLinkActive(item.href)
              return (
                <Link
                  key={item.id || item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-xs transition-colors ${
                    active
                      ? 'bg-ink text-paper font-semibold'
                      : 'text-ink/80 hover:bg-rule/30 hover:text-ink'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="pt-3 border-t border-rule flex items-center justify-between">
            <div className="text-xxs font-mono text-graphite">
              mannnishkumawat@gmail.com
            </div>
            <Link
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-1.5 text-xs font-medium rounded-xs bg-signal text-white"
            >
              Get in touch →
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
