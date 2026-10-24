'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { SiteSettings } from '@/lib/queries'
import { t, type CopyMap } from '@/lib/copy'

interface AboutProps {
  copy: CopyMap
  settings: SiteSettings | null
}

const ABOUT_MODES = [
  {
    id: 'leader',
    title: 'Strategy & Leadership',
    src: '/portraits/leader.webp',
    caption: 'Forward Deployed Engineering Partner',
    sub: 'Zero translation loss between vision and code',
  },
  {
    id: 'builder',
    title: 'In the Codebase',
    src: '/portraits/builder.webp',
    caption: 'Hands-on Production Architect',
    sub: 'Deploying high-concurrency systems & models',
  },
]

export function About({ copy, settings }: AboutProps) {
  const [activeModeIdx, setActiveModeIdx] = useState(0)
  const activeMode = ABOUT_MODES[activeModeIdx]

  const title = t(copy, 'about.title', 'About Manish Kumawat')
  const resumeCta = t(copy, 'about.cta.resume', 'Download résumé')
  const defaultBio =
    'I am a Forward Deployed AI Engineer and Designer. I bridge the gap between technical machine learning architecture and high-fidelity interface design. My work centers on moving into complex client environments, diagnosing core workflow bottlenecks, and shipping AI systems that measurably move numbers in production.'
  const bio = t(copy, 'about.body', defaultBio)

  return (
    <section id="about" aria-label="About" className="py-12 lg:py-16 text-left space-y-8">
      <div className="border-b border-rule pb-4">
        <h2 className="text-h2 font-medium text-ink tracking-tight">
          {title}
        </h2>
        <p className="text-graphite text-xs sm:text-sm mt-1 font-display">
          Forward Deployed AI Engineer • Visual Interface Designer • India / Remote
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Detailed Bio Narrative & Capabilities (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="font-prose text-body text-ink/90 leading-relaxed space-y-4">
            <p className="text-base sm:text-lg text-ink font-medium leading-snug">
              "Most companies don't lack models or designs — they lack the builder who can connect deep neural capabilities to interfaces humans actually love using."
            </p>
            <p>{bio}</p>
            <p>
              From architecting production booking engines that eliminate OTA commissions, to multi-tier volunteer coordination platforms managing thousands of records, my work is driven by zero tolerance for fluff: high craft, clean data models, and measurable operational velocity.
            </p>
          </div>

          {/* Capabilities Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-rule/70 text-xs font-display">
            <div className="space-y-1.5 p-3 rounded-xs border border-rule bg-rule/10">
              <span className="text-xxs font-mono uppercase text-signal tracking-wider block">
                01 // AI ARCHITECTURE
              </span>
              <p className="text-ink font-medium text-xs">
                LLM Workflows, RAG Engines, Multi-Agent Systems, Vision Models
              </p>
            </div>

            <div className="space-y-1.5 p-3 rounded-xs border border-rule bg-rule/10">
              <span className="text-xxs font-mono uppercase text-signal tracking-wider block">
                02 // INTERFACE CRAFT
              </span>
              <p className="text-ink font-medium text-xs">
                Next.js 16, Kinetic Typography, Micro-interactions, Design Tokens
              </p>
            </div>

            <div className="space-y-1.5 p-3 rounded-xs border border-rule bg-rule/10">
              <span className="text-xxs font-mono uppercase text-signal tracking-wider block">
                03 // PRODUCTION BACKEND
              </span>
              <p className="text-ink font-medium text-xs">
                Supabase / Postgres RLS, Realtime Sync, Edge Computing, Cloudflare
              </p>
            </div>

            <div className="space-y-1.5 p-3 rounded-xs border border-rule bg-rule/10">
              <span className="text-xxs font-mono uppercase text-signal tracking-wider block">
                04 // ART & SYSTEMS
              </span>
              <p className="text-ink font-medium text-xs">
                Brand Identity, Large-Scale Exhibition Systems, Video Direction
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-4">
            <a
              href="/Manish_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-data font-medium text-paper bg-ink px-4 py-2.5 rounded-xs hover:bg-ink/90 transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>{resumeCta}</span>
              <span className="text-xs text-paper/70 font-mono">(PDF)</span>
            </a>

            <a
              href="#contact"
              className="text-data font-medium text-ink hover:text-signal transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Initiate collaboration</span>
              <span>&rarr;</span>
            </a>
          </div>
        </div>

        {/* Right: Interactive 3D Tilt Portrait Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="group relative rounded-xs border border-rule bg-paper overflow-hidden shadow-sm hover:shadow-md transition-all">
            {/* Portrait Image Frame */}
            <div className="relative aspect-4/5 w-full overflow-hidden bg-ink">
              <Image
                src={activeMode.src}
                alt={activeMode.caption}
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent pointer-events-none" />

              {/* Verified Badge */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xs backdrop-blur-md bg-ink/75 border border-white/10 text-paper text-xxs font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
                <span>VERIFIED OPERATOR</span>
              </div>

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-3 left-3 right-3 text-paper space-y-1">
                <span className="text-xxs font-mono uppercase tracking-wider text-paper/70 block">
                  {activeMode.title}
                </span>
                <p className="text-sm font-semibold">{activeMode.caption}</p>
                <p className="text-xxs text-paper/80 font-mono">{activeMode.sub}</p>
              </div>
            </div>

            {/* View Switcher Controls */}
            <div className="p-3 border-t border-rule bg-rule/15 flex items-center justify-between">
              <span className="text-xxs font-mono text-graphite">PORTRAIT LENS:</span>
              <div className="flex items-center gap-1.5">
                {ABOUT_MODES.map((m, idx) => {
                  const active = idx === activeModeIdx
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setActiveModeIdx(idx)}
                      className={`px-2.5 py-1 text-xxs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                        active
                          ? 'bg-ink text-paper font-semibold'
                          : 'text-graphite hover:text-ink hover:bg-rule/40'
                      }`}
                    >
                      {m.id}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="p-3.5 rounded-xs border border-rule bg-rule/10 space-y-2 text-xxs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-graphite">AVAILABILITY:</span>
              <span className="text-signal font-semibold">Q4 / Q1 CLIENT SPRINT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-graphite">BASED IN:</span>
              <span className="text-ink font-semibold">INDIA • WORLDWIDE REMOTE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-graphite">RESPONSE TIME:</span>
              <span className="text-ink font-semibold">&lt; 24 HOURS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
