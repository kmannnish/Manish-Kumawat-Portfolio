import { getCopyMap, getSiteSettings } from '@/lib/queries'
import { Hero } from '@/components/sections/Hero'

export default async function HomePage() {
  const [copy, settings] = await Promise.all([
    getCopyMap(),
    getSiteSettings(),
  ])

  return (
    <div className="space-y-24">
      {/* S4. Hero */}
      <Hero copy={copy} settings={settings} />

      {/* Placeholder anchors for S5 Trace and subsequent sections */}
      <div id="work" className="min-h-[30vh]" />
      <div id="contact" className="min-h-[30vh]" />
    </div>
  )
}
