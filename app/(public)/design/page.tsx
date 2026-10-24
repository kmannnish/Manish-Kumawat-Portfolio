import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPublishedProjects, getCopyMap, getDesignMedia, getSiteSettings } from '@/lib/queries'
import { t } from '@/lib/copy'
import { MorphDotsToText } from '@/components/ui/MorphDotsToText'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const name = settings?.owner_name || 'Manish Kumawat'
  return {
    title: `Design & Art Direction — ${name}`,
    description:
      'Graphic systems, event stage architecture, print systems, and digital mockups by Manish Kumawat.',
  }
}

export default async function DesignPage() {
  const [projects, copy, media, settings] = await Promise.all([
    getPublishedProjects(),
    getCopyMap(),
    getDesignMedia(),
    getSiteSettings(),
  ])

  const title = t(copy, 'design.title', 'Design & Art Direction')
  const subtitle = t(
    copy,
    'design.subtitle',
    'Graphic systems, event stage architecture, print systems & digital mockups.'
  )
  const backLabel = t(copy, 'project.back', '← All work')
  const emptyLabel = t(copy, 'design.empty', 'No design work published yet.')

  const designProjects = projects.filter((p) => p.show_in_design_section)

  return (
    <div className="py-12 lg:py-16 text-left max-w-5xl space-y-12">
      {/* Back navigation */}
      <div>
        <Link
          href="/#work"
          className="text-data text-graphite hover:text-signal transition-colors inline-flex items-center gap-1 font-medium font-display"
        >
          {backLabel}
        </Link>
      </div>

      {/* Header */}
      <header className="space-y-3">
        <h1 className="text-h2 font-medium tracking-tight text-ink font-display">
          {title}
        </h1>
        <p className="font-prose text-base text-ink/80 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </header>

      {/* Morphing Dots to Text Banner */}
      <MorphDotsToText
        words={['DESIGN', 'SYSTEMS', 'CRAFT', 'AI & ART']}
        height={200}
      />

      {/* Design Projects Grid */}
      <section aria-label="Design Projects" className="space-y-6">
        <div className="flex items-center justify-between border-b border-rule pb-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-graphite font-display">
            Selected Systems & Case Studies ({designProjects.length})
          </h2>
        </div>

        {designProjects.length === 0 ? (
          <p className="text-data text-graphite font-display">{emptyLabel}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {designProjects.map((project) => {
              const metricsList = Array.isArray(project.metrics) ? (project.metrics as any[]) : []
              const headlineMetric =
                metricsList.find((m) => m.is_headline === true) || metricsList[0] || null

              return (
                <div
                  key={project.id}
                  className="group relative flex flex-col justify-between rounded-xs border border-rule hover:border-rule-strong bg-rule/10 hover:bg-rule/25 transition-all p-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-h3 font-medium text-ink group-hover:text-signal transition-colors font-display">
                        <Link href={`/work/${project.slug}`} className="focus:outline-hidden">
                          <span className="absolute inset-0" aria-hidden="true" />
                          {project.title}
                        </Link>
                      </h3>
                      {project.accent_color && (
                        <span
                          className="size-2.5 rounded-full inline-block shrink-0 mt-1"
                          style={{ backgroundColor: project.accent_color }}
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    {headlineMetric && (
                      <div className="inline-flex items-baseline gap-1.5 text-xs font-display">
                        <span className="font-medium text-signal">
                          {headlineMetric.after || headlineMetric.label}
                        </span>
                        {headlineMetric.before && (
                          <span className="text-graphite">
                            (was {headlineMetric.before})
                          </span>
                        )}
                        {headlineMetric.unit && (
                          <span className="text-ink/70">
                            {headlineMetric.unit}
                          </span>
                        )}
                      </div>
                    )}

                    {project.summary && (
                      <p className="font-prose text-sm text-ink/85 leading-relaxed line-clamp-3">
                        {project.summary}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-rule/60 flex flex-wrap items-center justify-between gap-3 text-xs font-display">
                    {project.tech && project.tech.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 z-10">
                        {project.tech.map((t) => (
                          <span
                            key={t.id}
                            className="rounded-xs bg-rule/50 px-2 py-0.5 text-xs text-ink/80 border border-rule/70"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-graphite">Design System</span>
                    )}

                    <span className="text-signal group-hover:translate-x-0.5 transition-transform font-medium">
                      Case study &rarr;
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Standalone Design Media Assets (if populated in media library) */}
      {media.length > 0 && (
        <section aria-label="Visual Gallery" className="space-y-6 pt-6">
          <div className="flex items-center justify-between border-b border-rule pb-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-graphite font-display">
              Visual Artefacts & Print Gallery ({media.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {media.map((item) => (
              <figure
                key={item.id}
                className="group rounded-xs border border-rule overflow-hidden bg-rule/10 space-y-2 p-3"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xs bg-rule/30">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://clyjwzkmxghizbnmkgal.supabase.co'}/storage/v1/object/public/${item.bucket}/${item.path}`}
                    alt={item.alt_text || item.caption || 'Design artifact'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-102"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                {item.caption && (
                  <figcaption className="text-xs text-ink/80 font-display">
                    {item.caption}
                  </figcaption>
                )}
                {item.tool_tags && item.tool_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tool_tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase tracking-wider text-graphite bg-rule/40 px-1.5 py-0.5 rounded-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Bottom Contact Rail */}
      <footer className="pt-10 border-t border-rule font-display">
        <p className="text-sm text-graphite">
          Looking for custom design systems or art direction?{' '}
          <Link href="/#contact" className="text-signal hover:underline font-medium">
            Get in touch &rarr;
          </Link>
        </p>
      </footer>
    </div>
  )
}
