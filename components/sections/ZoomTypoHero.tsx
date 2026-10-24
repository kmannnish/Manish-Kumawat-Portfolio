'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { t, type CopyMap } from '@/lib/copy'
import type { SiteSettings } from '@/lib/queries'

interface ZoomTypoHeroProps {
  copy: CopyMap
  settings: SiteSettings | null
}

const PORTRAITS = [
  {
    id: 'hero',
    title: 'AI Architect',
    src: '/portraits/hero.webp',
    fallbackSrc: '/portraits/hero_portrait.jpg',
    tag: '01 // ARCHITECT',
    role: 'Forward Deployed AI Lead',
    quote: 'Moving into complex stacks to ship measurable production AI.',
  },
  {
    id: 'designer',
    title: 'Creative Designer',
    src: '/portraits/designer.webp',
    fallbackSrc: '/portraits/creative_designer.jpg',
    tag: '02 // DESIGNER',
    role: 'High-Craft Interface Director',
    quote: 'Bridging engineering precision with memorable aesthetic craft.',
  },
  {
    id: 'builder',
    title: 'Builder in Action',
    src: '/portraits/builder.webp',
    fallbackSrc: '/portraits/builder_in_action.jpg',
    tag: '03 // BUILDER',
    role: 'Full-Stack & Systems Engineer',
    quote: 'Deep in the codebase: architecture, pipelines, and performance.',
  },
  {
    id: 'leader',
    title: 'Approachable Leader',
    src: '/portraits/leader.webp',
    fallbackSrc: '/portraits/approachable_leader.jpg',
    tag: '04 // LEADER',
    role: 'Partner & Client Strategist',
    quote: 'Zero jargon. Direct communication. Clear business outcomes.',
  },
]

export function ZoomTypoHero({ copy, settings }: ZoomTypoHeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isClient, setIsClient] = useState(false)

  const activePortrait = PORTRAITS[activePhotoIdx]

  useEffect(() => {
    setIsClient(true)

    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) {
            ticking = false
            return
          }
          const rect = containerRef.current.getBoundingClientRect()
          const totalScroll = rect.height - window.innerHeight
          if (totalScroll > 0) {
            const current = -rect.top
            const progress = Math.min(1, Math.max(0, current / totalScroll))
            setScrollProgress(progress)

            // Auto-advance photos smoothly on deeper scroll if not clicked
            if (progress > 0.75) {
              // deeper zoom
            }
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Calculate exponential scale for Apple-like zoom through typo
  // 0% -> 1.0 scale
  // 60% -> ~4.5 scale
  // 90% -> ~24.0 scale (zoomed through into the photo)
  const zoomScale = Math.max(1, 1 + Math.pow(scrollProgress, 2.2) * 26)
  const maskOpacity = Math.max(0, 1 - Math.pow(scrollProgress, 3) * 1.4)
  const photoScale = 1.15 - scrollProgress * 0.12
  const hudRevealOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.45) * 2.2))

  const headline = t(
    copy,
    'hero.headline',
    settings?.tagline ||
      'Forward deployed. I move into your stack and leave behind something that measurably works.'
  )

  const ownerName = settings?.owner_name || 'Manish Kumawat'
  const roleTitle = settings?.role_title || 'Forward Deployed AI Engineer & Designer'

  return (
    <section
      id="hero"
      ref={containerRef}
      aria-label="Introduction"
      className="relative w-full h-[220vh] select-none"
    >
      {/* Sticky Viewport Frame */}
      <div className="sticky top-12 left-0 w-full h-[calc(100vh-3.25rem)] overflow-hidden rounded-xs border border-rule bg-ink text-paper">
        {/* ── LAYER 1: BACKGROUND PORTRAIT WITH DYNAMIC LENS SWITCHER ── */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {PORTRAITS.map((p, idx) => (
            <div
              key={p.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-out ${
                idx === activePhotoIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              style={{
                transform: `scale(${photoScale})`,
                transition: 'opacity 0.7s ease, transform 0.1s linear',
              }}
            >
              <Image
                src={p.src}
                alt={`${ownerName} — ${p.title}`}
                fill
                priority={idx === 0}
                className="object-cover object-center sm:object-top"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
              {/* Subtle film grain & gradient shading for high contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-ink/40 pointer-events-none" />
              <div className="absolute inset-0 bg-ink/15 mix-blend-multiply pointer-events-none" />
            </div>
          ))}
        </div>

        {/* ── LAYER 2: THE SVG ZOOM-IN NEGATIVE TYPOGRAPHY MASK (Apple.com & Webflow Technique) ── */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          style={{
            opacity: maskOpacity,
            willChange: 'transform, opacity',
          }}
        >
          <svg
            className="w-full h-full block"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <mask id="apple-typo-cutout-mask" x="0" y="0" width="100%" height="100%">
                {/* Everything in white is visible paper */}
                <rect x="0" y="0" width="100%" height="100%" fill="#FFFFFF" />

                {/* Everything in black is CUT OUT to reveal the portrait underneath */}
                <g
                  style={{
                    transformOrigin: '720px 450px',
                    transform: `scale(${zoomScale})`,
                  }}
                >
                  {/* Giant Primary Display Typography */}
                  <text
                    x="720"
                    y="390"
                    textAnchor="middle"
                    fill="#000000"
                    fontFamily="Instrument Sans, sans-serif"
                    fontWeight="900"
                    fontSize="136"
                    letterSpacing="-0.04em"
                  >
                    MANISH
                  </text>
                  <text
                    x="720"
                    y="510"
                    textAnchor="middle"
                    fill="#000000"
                    fontFamily="Instrument Sans, sans-serif"
                    fontWeight="900"
                    fontSize="136"
                    letterSpacing="-0.04em"
                  >
                    KUMAWAT
                  </text>

                  {/* Subtitle cutout hairline */}
                  <text
                    x="720"
                    y="575"
                    textAnchor="middle"
                    fill="#000000"
                    fontFamily="Instrument Sans, sans-serif"
                    fontWeight="700"
                    fontSize="22"
                    letterSpacing="0.22em"
                  >
                    AI ENGINEER & DESIGNER
                  </text>
                </g>
              </mask>
            </defs>

            {/* The paper mask overlay with the cutout letters */}
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="#EAEFE9"
              mask="url(#apple-typo-cutout-mask)"
            />
          </svg>
        </div>

        {/* ── LAYER 3: TOP OVERLAY HUD (Fixed within Sticky Frame) ── */}
        <div className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 lg:p-8 flex items-start justify-between pointer-events-auto">
          {/* Left: Persona / Role Pill */}
          <div className="space-y-1 backdrop-blur-md bg-ink/40 border border-white/10 px-3 py-2 rounded-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
              <span className="text-xxs font-mono uppercase tracking-wider text-paper/90">
                {activePortrait.tag}
              </span>
            </div>
            <p className="text-xs font-medium text-paper tracking-tight">
              {activePortrait.role}
            </p>
          </div>

          {/* Right: Interactive 4-Photo Lens Switcher */}
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xs backdrop-blur-md bg-ink/60 border border-white/10">
            {PORTRAITS.map((p, idx) => {
              const active = idx === activePhotoIdx
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`px-2 sm:px-2.5 py-1 text-xxs font-mono uppercase tracking-wider rounded-xs transition-all cursor-pointer ${
                    active
                      ? 'bg-paper text-ink font-bold shadow-xs'
                      : 'text-paper/70 hover:text-paper hover:bg-white/10'
                  }`}
                  title={`Switch view to ${p.title}`}
                >
                  {p.title.split(' ')[0]}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── LAYER 4: CENTER SCROLL HINT (Visible early in scroll) ── */}
        <div
          className="absolute inset-x-0 bottom-24 sm:bottom-28 z-30 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300"
          style={{
            opacity: Math.max(0, 1 - scrollProgress * 3),
          }}
        >
          <div className="px-3.5 py-1.5 rounded-full bg-ink/80 text-paper text-xxs font-mono tracking-widest uppercase border border-white/20 backdrop-blur-sm flex items-center gap-2 shadow-sm">
            <span>Scroll to zoom typography</span>
            <span className="animate-bounce font-bold">↓</span>
          </div>
        </div>

        {/* ── LAYER 5: REVEALED IMPACT OVERLAY (Crossfades in as Zoom Completes) ── */}
        <div
          className="absolute inset-x-0 bottom-0 z-30 p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 pointer-events-auto transition-all"
          style={{
            opacity: hudRevealOpacity,
            transform: `translateY(${(1 - hudRevealOpacity) * 20}px)`,
          }}
        >
          {/* Left: Bio Statement & Active Quote */}
          <div className="max-w-xl space-y-2 backdrop-blur-md bg-ink/75 p-4 rounded-xs border border-white/15">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-mark" />
              <span className="text-xxs font-mono uppercase text-paper/70 tracking-wider">
                Deployment Mission
              </span>
            </div>
            <p className="text-xs sm:text-sm text-paper font-display leading-relaxed">
              "{activePortrait.quote}"
            </p>
            <p className="text-xxs text-paper/60 pt-1 font-mono">
              India • Worldwide Remote // Full-Lifecycle AI Solutions
            </p>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="#work"
              className="px-4 py-2 text-xs font-medium rounded-xs bg-paper text-ink hover:bg-white transition-all shadow-md cursor-pointer"
            >
              Explore Work ↓
            </Link>
            <Link
              href="#contact"
              className="px-4 py-2 text-xs font-medium rounded-xs bg-signal text-white hover:bg-signal/90 transition-all shadow-md cursor-pointer"
            >
              Get in touch →
            </Link>
          </div>
        </div>

        {/* ── BOTTOM PROGRESS TICKER BAR ── */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-40">
          <div
            className="h-full bg-signal transition-all duration-75"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>
    </section>
  )
}
