import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  getAllProjectSlugs,
  getProjectBySlug,
  getCopyMap,
} from '@/lib/queries'
import { t } from '@/lib/copy'
import { ProjectGallery } from '@/components/work/ProjectGallery'

export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    return {
      title: 'Project Not Found',
    }
  }

  const title = project.seo_title || project.title
  const description = project.seo_description || project.summary

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

function getYearRange(startedOn: string, endedOn: string | null): string {
  try {
    const startYear = new Date(startedOn).getFullYear()
    if (!endedOn) return `${startYear} — Present`
    const endYear = new Date(endedOn).getFullYear()
    return startYear === endYear ? `${startYear}` : `${startYear} — ${endYear}`
  } catch {
    return ''
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [project, copy] = await Promise.all([
    getProjectBySlug(slug),
    getCopyMap(),
  ])

  if (!project) {
    notFound()
  }

  const backLabel = t(copy, 'project.back', '← All work')
  const problemLabel = t(copy, 'project.problem.label', 'The problem')
  const approachLabel = t(copy, 'project.approach.label', 'The approach')
  const outcomeLabel = t(copy, 'project.outcome.label', 'The outcome')
  const metricsLabel = t(copy, 'project.metrics.label', 'Impact')
  const linksLabel = t(copy, 'project.links.label', 'Links')

  const yearRange = getYearRange(project.started_on, project.ended_on)
  const linksList = Array.isArray(project.links) ? (project.links as any[]) : []
  const metricsList = Array.isArray(project.metrics)
    ? (project.metrics as any[])
    : []

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const coverItem = project.media?.find((m) => m.role === 'cover') || project.media?.[0]
  const coverUrl = coverItem?.media
    ? coverItem.media.path.startsWith('http')
      ? coverItem.media.path
      : `${supabaseUrl}/storage/v1/object/public/${coverItem.media.bucket}/${coverItem.media.path}`
    : null

  return (
    <article
      className="py-12 lg:py-16 text-left max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
      style={
        {
          '--project-accent': project.accent_color || 'var(--color-signal)',
        } as React.CSSProperties
      }
    >
      {/* Back link */}
      <div className="mb-10">
        <Link
          href="/#work"
          className="text-data text-graphite hover:text-signal transition-colors inline-flex items-center gap-1 font-medium"
        >
          {backLabel}
        </Link>
      </div>

      {/* Project Header */}
      <header className="mb-12 border-b border-rule pb-10">
        <h1 className="text-h2 font-medium tracking-tight text-ink mb-4 max-w-prose">
          {project.title}
        </h1>

        {/* Type-differentiated columns: Org/Client, Role, Dates (no middle dots) */}
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-data text-graphite font-display">
          {project.role && (
            <div className="text-ink font-medium">{project.role}</div>
          )}
          {project.client_name && <div>{project.client_name}</div>}
          {yearRange && <div className="tabular-nums">{yearRange}</div>}
        </div>

        {/* Tech tags */}
        {project.tech && project.tech.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-5">
            {project.tech.map((t) => (
              <span
                key={t.id}
                className="rounded-xs bg-rule/50 px-2.5 py-0.5 text-xs text-ink border border-rule"
              >
                {t.name}
              </span>
            ))}
          </div>
        )}

        {/* External links */}
        {linksList.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-rule/50">
            <span className="text-xs text-graphite uppercase tracking-wider font-medium">
              {linksLabel}:
            </span>
            {linksList.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-data text-signal hover:underline font-medium inline-flex items-center"
              >
                {l.label || 'View'}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* Primary Hero Screenshot Showcase */}
      {coverItem && coverUrl && (
        <div className="mb-14 rounded-xs border border-rule/80 overflow-hidden bg-rule/20 shadow-xs">
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full max-h-[580px] overflow-hidden flex items-center justify-center bg-ink/5">
            <Image
              src={coverUrl}
              alt={coverItem.media.alt_text || project.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-contain object-center"
              placeholder={coverItem.media.placeholder ? 'blur' : 'empty'}
              blurDataURL={coverItem.media.placeholder || undefined}
            />
          </div>
          {coverItem.media.caption && (
            <div className="px-4 py-3 border-t border-rule/60 bg-paper/80 text-xs text-graphite font-display">
              {coverItem.media.caption}
            </div>
          )}
        </div>
      )}

      {/* Case Study Core: Problem → Approach → Outcome */}
      <div className="max-w-prose space-y-12">
        {project.problem && (
          <section aria-labelledby="problem-heading" className="space-y-3">
            <h2
              id="problem-heading"
              className="text-h3 font-medium text-ink tracking-tight"
            >
              {problemLabel}
            </h2>
            <div className="font-prose text-body text-ink/90 leading-relaxed whitespace-pre-line">
              {project.problem}
            </div>
          </section>
        )}

        {project.approach && (
          <section aria-labelledby="approach-heading" className="space-y-3">
            <h2
              id="approach-heading"
              className="text-h3 font-medium text-ink tracking-tight"
            >
              {approachLabel}
            </h2>
            <div className="font-prose text-body text-ink/90 leading-relaxed whitespace-pre-line">
              {project.approach}
            </div>
          </section>
        )}

        {project.outcome && (
          <section aria-labelledby="outcome-heading" className="space-y-3">
            <h2
              id="outcome-heading"
              className="text-h3 font-medium text-ink tracking-tight"
            >
              {outcomeLabel}
            </h2>
            <div className="font-prose text-body text-ink/90 leading-relaxed whitespace-pre-line">
              {project.outcome}
            </div>
          </section>
        )}

        {/* Markdown/Raw Body if present */}
        {project.body && !project.problem && (
          <div className="font-prose text-body text-ink/90 leading-relaxed whitespace-pre-line">
            {project.body}
          </div>
        )}

        {/* Metrics Block */}
        {metricsList.length > 0 && (
          <section
            aria-labelledby="metrics-heading"
            className="pt-6 border-t border-rule"
          >
            <h2
              id="metrics-heading"
              className="text-h3 font-medium text-ink tracking-tight mb-4"
            >
              {metricsLabel}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {metricsList.map((m, i) => {
                const isHeadline = m.is_headline === true
                return (
                  <div
                    key={i}
                    className="p-4 rounded-xs border border-rule/70 bg-rule/20"
                  >
                    <div className="text-xs text-graphite mb-1">{m.label}</div>
                    {/* Permitted use #2 of --mark: the one is_headline metric on a project detail page */}
                    <div
                      className={`text-xl font-medium tabular-nums font-display ${
                        isHeadline ? 'text-mark' : 'text-ink'
                      }`}
                    >
                      {m.before && (
                        <span className="text-graphite font-normal text-sm">
                          {m.before} →{' '}
                        </span>
                      )}
                      <span>
                        {m.after} {m.unit || ''}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {/* Media Gallery from project_media */}
      {project.media && project.media.length > 0 && (
        <ProjectGallery
          media={project.media.map(({ media, role, sort_order }) => ({
            id: media.id,
            url: media.path.startsWith('http')
              ? media.path
              : `${supabaseUrl}/storage/v1/object/public/${media.bucket}/${media.path}`,
            alt: media.alt_text || project.title,
            caption: media.caption,
            width: media.width,
            height: media.height,
            placeholder: media.placeholder,
            role,
            sort_order: sort_order || 0,
          }))}
          projectTitle={project.title}
          projectUrl={linksList.find((l: any) => l.kind === 'live')?.url || ''}
        />
      )}
    </article>
  )
}
