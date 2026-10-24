import { t, type CopyMap } from '@/lib/copy'
import type { SiteSettings } from '@/lib/queries'

interface HeroProps {
  copy: CopyMap
  settings: SiteSettings | null
}

export function Hero({ copy, settings }: HeroProps) {
  // Statement resolved through t() from the `copy` table with fallback to site_settings or wireframe default.
  // CLAUDE.md: No hardcoded user-facing strings.
  const statement = t(
    copy,
    'hero.headline',
    settings?.tagline ||
      'Forward deployed. I move into your stack and leave behind something that measurably works.'
  )

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="pt-10 sm:pt-14 lg:pt-18 pb-12 lg:pb-16 text-left"
    >
      <h1 className="max-w-prose font-display text-display text-ink text-balance">
        {statement}
      </h1>
    </section>
  )
}
