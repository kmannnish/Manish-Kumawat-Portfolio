import type { SiteSettings } from '@/lib/queries'
import { t, type CopyMap } from '@/lib/copy'

interface AboutProps {
  copy: CopyMap
  settings: SiteSettings | null
}

export function About({ copy, settings }: AboutProps) {
  const title = t(copy, 'about.title', 'About')
  const resumeCta = t(copy, 'about.cta.resume', 'Download résumé')
  const defaultBio =
    'I am a Forward Deployed AI Engineer and Designer. I bridge the gap between technical machine learning architecture and high-fidelity interface design. My work centers on moving into complex client environments, diagnosing core workflow bottlenecks, and shipping AI systems that measurably move numbers in production.'
  const bio = t(copy, 'about.body', defaultBio)

  return (
    <section id="about" aria-label="About" className="py-12 lg:py-16 text-left">
      <h2 className="text-h2 font-medium text-ink tracking-tight mb-6">
        {title}
      </h2>
      <div className="font-prose text-body text-ink/90 leading-relaxed max-w-prose space-y-4">
        <p>{bio}</p>
      </div>

      <div className="mt-8 pt-2">
        <a
          href="/Manish_Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-data font-medium text-ink hover:text-signal transition-colors inline-flex items-center gap-1.5"
        >
          <span>{resumeCta}</span>
          <span className="text-graphite text-xs">(PDF)</span>
        </a>
      </div>
    </section>
  )
}
