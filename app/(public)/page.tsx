import {
  getCopyMap,
  getSiteSettings,
  getTraceData,
  getPublishedProjects,
} from '@/lib/queries'
import { Hero } from '@/components/sections/Hero'
import { Trace } from '@/components/sections/Trace'
import { Work } from '@/components/sections/Work'

export default async function HomePage() {
  const [copy, settings, traceData, projects] = await Promise.all([
    getCopyMap(),
    getSiteSettings(),
    getTraceData(),
    getPublishedProjects(),
  ])

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* S4. Hero */}
      <Hero copy={copy} settings={settings} />

      {/* S5. Deployment Trace Chart */}
      <Trace data={traceData} copy={copy} />

      {/* S6A. Work Index */}
      <Work projects={projects} copy={copy} />

      {/* Placeholder anchor for S8 Contact */}
      <div id="contact" className="min-h-[20vh]" />
    </div>
  )
}
