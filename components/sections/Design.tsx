import Link from 'next/link'
import type { ProjectWithTech } from '@/lib/queries'
import { t, type CopyMap } from '@/lib/copy'

interface DesignProps {
  projects: ProjectWithTech[]
  copy: CopyMap
}

export function Design({ projects, copy }: DesignProps) {
  const title = t(copy, 'nav.design', 'Design')
  const emptyLabel = t(copy, 'design.empty', 'No design work published yet.')

  const designProjects = projects.filter((p) => p.show_in_design_section)

  if (designProjects.length === 0) {
    return null
  }

  return (
    <section id="design" aria-label="Design work" className="py-12 lg:py-16 text-left">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-h2 font-medium text-ink tracking-tight">
          {title}
        </h2>
        <Link
          href="/design"
          className="text-xs text-graphite hover:text-signal transition-colors font-display"
        >
          View all &rarr;
        </Link>
      </div>
      <p className="text-graphite text-sm mb-8 font-display">
        Graphic work, print systems & art direction
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
        {designProjects.map((project) => (
          <Link
            key={project.id}
            href={`/work/${project.slug}`}
            className="group block p-5 rounded-xs border border-rule hover:border-rule-strong bg-rule/10 hover:bg-rule/30 transition-all"
          >
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-h3 font-medium text-ink group-hover:text-signal transition-colors">
                {project.title}
              </h3>
              {project.accent_color && (
                <span
                  className="size-2 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: project.accent_color }}
                  aria-hidden="true"
                />
              )}
            </div>

            {project.summary && (
              <p className="font-prose text-sm text-ink/85 leading-relaxed line-clamp-2 mb-4">
                {project.summary}
              </p>
            )}

            {project.tech && project.tech.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.tech.map((t) => (
                  <span
                    key={t.id}
                    className="text-xs text-ink/80 bg-rule/40 px-2 py-0.5 rounded-xs border border-rule"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
