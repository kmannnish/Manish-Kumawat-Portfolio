import { getCopyMap, getSiteSettings, getTraceData } from '@/lib/queries'
import { Hero } from '@/components/sections/Hero'
import { Trace } from '@/components/sections/Trace'

export default async function HomePage() {
  const [copy, settings, traceData] = await Promise.all([
    getCopyMap(),
    getSiteSettings(),
    getTraceData(),
  ])

  return (
    <div className="space-y-16 lg:space-y-20">
      {/* S4. Hero */}
      <Hero copy={copy} settings={settings} />

      {/* S5. Deployment Trace Chart */}
      <Trace data={traceData} copy={copy} />

      {/* Placeholder anchors for S6 Work and S8 Contact */}
      <div id="work" className="min-h-[20vh]" />
      <div id="contact" className="min-h-[20vh]" />
    </div>
  )
}
