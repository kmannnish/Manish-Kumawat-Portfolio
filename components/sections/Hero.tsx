import { ZoomTypoHero } from './ZoomTypoHero'
import type { SiteSettings } from '@/lib/queries'
import type { CopyMap } from '@/lib/copy'

interface HeroProps {
  copy: CopyMap
  settings: SiteSettings | null
}

export function Hero({ copy, settings }: HeroProps) {
  return <ZoomTypoHero copy={copy} settings={settings} />
}
