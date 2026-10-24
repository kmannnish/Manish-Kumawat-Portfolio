'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { NavItem } from '@/lib/queries'

interface IndexRailProps {
  navItems: NavItem[]
}

export function IndexRail({ navItems }: IndexRailProps) {
  const [activeHref, setActiveHref] = useState<string>('')
  const [scrollProgress, setScrollProgress] = useState<number>(0)

  useEffect(() => {
    // 1. Calculate reading scroll progress for mobile top line
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight > 0) {
        const currentProgress = (window.scrollY / scrollHeight) * 100
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)))
      }
    }

    // 2. Set up scroll-spy observer for section anchors
    const anchorItems = navItems.filter(
      (item) => !item.is_external && item.href.includes('#')
    )
    const sectionIds = anchorItems
      .map((item) => item.href.split('#')[1])
      .filter(Boolean)

    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Find the first intersecting entry from top to bottom
      const visible = entries.find((e) => e.isIntersecting)
      if (visible?.target?.id) {
        const matchingItem = navItems.find((item) =>
          item.href.endsWith(`#${visible.target.id}`)
        )
        if (matchingItem) {
          setActiveHref(matchingItem.href)
        }
      }
    }

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    })

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    // Default to first item if none active
    if (navItems.length > 0 && !activeHref) {
      setActiveHref(navItems[0].href)
    }

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [navItems, activeHref])

  return (
    <>
      {/* Mobile (< lg): Thin scroll progress line directly beneath TopBar */}
      <div
        className="fixed top-11 left-0 z-30 h-[2px] w-full bg-rule lg:hidden"
        aria-hidden="true"
      >
        <div
          className="h-full bg-signal transition-[width] duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Desktop (>= lg): Sticky left index rail */}
      <aside className="hidden lg:block lg:w-44 xl:w-52 shrink-0">
        <nav
          aria-label="Page navigation"
          className="sticky top-11 flex h-[calc(100vh-2.75rem)] flex-col justify-between py-12 pr-6"
        >
          <ul className="space-y-4 text-data">
            {navItems.map((item) => {
              const isActive = activeHref === item.href
              const isExternal = item.is_external

              return (
                <li key={item.id} className="group">
                  <Link
                    href={item.href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className={`flex items-center gap-3 transition-colors duration-150 ${
                      isActive
                        ? 'text-signal font-medium'
                        : 'text-graphite hover:text-ink'
                    }`}
                  >
                    {/* Position indicator: filled circle in --signal when active, outline when inactive */}
                    <span
                      className={`inline-block size-2 rounded-full transition-transform duration-150 ${
                        isActive
                          ? 'scale-110 bg-signal ring-2 ring-signal/20'
                          : 'border border-rule-strong bg-transparent group-hover:border-ink'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="tracking-tight">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
