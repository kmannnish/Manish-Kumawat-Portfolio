import Link from 'next/link'
import Image from 'next/image'
import type { ProjectWithTech } from '@/lib/queries'
import { t, type CopyMap } from '@/lib/copy'

interface WorkProps {
  projects: ProjectWithTech[]
  copy: CopyMap
}

function getYearRange(startedOn: string, endedOn: string | null): string {
  try {
    const startYear = new Date(startedOn).getFullYear()
    if (!endedOn) {
      return `${startYear} — Present`
    }
    const endYear = new Date(endedOn).getFullYear()
    return startYear === endYear ? `${startYear}` : `${startYear} — ${endYear}`
  } catch {
    return ''
  }
}

export function Work({ projects, copy }: WorkProps) {
  const sectionTitle = t(copy, 'work.index.label', 'Selected work')
  const emptyLabel = t(copy, 'work.empty', 'No published projects yet.')
  const viewAllLabel = t(copy, 'work.cta.all', 'View all projects')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  if (projects.length === 0) {
    return (
      <section id="work" aria-label="Work" className="py-12 text-left">
        <h2 className="text-h2 font-medium text-ink tracking-tight mb-6">
          {sectionTitle}
        </h2>
        <p className="text-ink/80 text-sm">{emptyLabel}</p>
      </section>
    )
  }

  return (
    <section
      id="work"
      aria-label="Selected work"
      className="py-12 lg:py-16 text-left"
    >
      <h2 className="text-h2 font-medium text-ink tracking-tight mb-8">
        {sectionTitle}
      </h2>

      {/* Rows deliberately bleed past the 68ch reading measure per docs/02 §2 */}
      <ol className="group/list max-w-5xl space-y-6">
        {projects.map((project) => {
          const yearRange = getYearRange(project.started_on, project.ended_on)
          const headline = project.headlineMetric
          const coverUrl = project.cover
            ? project.cover.path.startsWith('http')
              ? project.cover.path
              : `${supabaseUrl}/storage/v1/object/public/${project.cover.bucket}/${project.cover.path}`
            : null

          return (
            <li
              key={project.id}
              className="group relative rounded-sm p-4 sm:p-5 transition-all duration-150 group-hover/list:opacity-70 hover:!opacity-100 focus-within:!opacity-100 hover:bg-rule/20 border border-transparent hover:border-rule/50"
            >
              <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Full-row hit area: link sits semantically on the title */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-h3 font-medium text-ink">
                        <Link
                          href={`/work/${project.slug}`}
                          className="inline-flex items-center text-ink outline-hidden focus-visible:underline"
                        >
                          {/* Full-row hit area */}
                          <span
                            className="absolute inset-0 z-10"
                            aria-hidden="true"
                          />
                          <span>{project.title}</span>
                        </Link>
                      </h3>
                      {project.role && (
                        <span className="text-xs font-normal text-ink/80">
                          {project.role}
                        </span>
                      )}
                    </div>

                    {/* Headline Metric IN --ink (docs/02 §2: --mark is reserved for detail pages) */}
                    <div className="flex items-center gap-3 shrink-0">
                      {headline && (
                        <div className="text-sm font-medium tabular-nums text-ink">
                          {headline.before && (
                            <span className="font-normal text-ink/80">
                              {headline.before} →{' '}
                            </span>
                          )}
                          <span>
                            {headline.after} {headline.unit || ''}
                          </span>
                        </div>
                      )}
                      {yearRange && (
                        <span className="text-xs font-normal tabular-nums text-ink/75">
                          {yearRange}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary in Newsreader prose font */}
                  {project.summary && (
                    <p className="font-prose text-sm text-ink/90 leading-relaxed mb-4 max-w-prose">
                      {project.summary}
                    </p>
                  )}

                  {/* Tech Tags from project_tech */}
                  {project.tech && project.tech.length > 0 && (
                    <ul
                      className="relative z-20 flex flex-wrap gap-1.5"
                      aria-label="Technologies used"
                    >
                      {project.tech.map((t) => (
                        <li
                          key={t.id}
                          className="rounded-xs bg-rule/50 px-2 py-0.5 text-xs font-normal text-ink border border-rule"
                        >
                          {t.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Screenshot Preview Thumbnail */}
                {coverUrl && (
                  <div className="relative shrink-0 w-full md:w-56 lg:w-64 aspect-[16/10] rounded-xs overflow-hidden border border-rule/80 bg-rule/20 shadow-xs group-hover:border-signal/40 group-hover:shadow-md transition-all">
                    <Image
                      src={coverUrl}
                      alt={project.cover?.alt_text || project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 256px"
                      className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                      placeholder={project.cover?.placeholder ? 'blur' : 'empty'}
                      blurDataURL={project.cover?.placeholder || undefined}
                    />
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {/* Link to full /archive */}
      <div className="mt-8 pt-4">
        <Link
          href="/archive"
          className="inline-flex items-center text-data font-medium text-ink hover:text-signal transition-colors"
        >
          {viewAllLabel}
        </Link>
      </div>
    </section>
  )
}
