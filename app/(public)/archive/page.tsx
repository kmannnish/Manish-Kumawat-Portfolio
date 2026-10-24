import Link from 'next/link'
import { getArchiveProjects, getCopyMap } from '@/lib/queries'
import { t } from '@/lib/copy'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const [projects, copy] = await Promise.all([
    getArchiveProjects(),
    getCopyMap(),
  ])

  const title = t(copy, 'archive.title', 'Archive')
  const emptyLabel = t(copy, 'archive.empty', 'Nothing archived yet.')
  const backLabel = t(copy, 'project.back', '← All work')

  return (
    <div className="py-12 lg:py-16 text-left max-w-5xl">
      {/* Back navigation */}
      <div className="mb-8">
        <Link
          href="/#work"
          className="text-data text-graphite hover:text-signal transition-colors inline-flex items-center gap-1 font-medium"
        >
          {backLabel}
        </Link>
      </div>

      <header className="mb-10">
        <h1 className="text-h2 font-medium tracking-tight text-ink">
          {title}
        </h1>
      </header>

      {projects.length === 0 ? (
        <p className="text-data text-graphite">{emptyLabel}</p>
      ) : (
        <div className="relative overflow-x-auto">
          {/* Real <table> with sticky backdrop-blur head and progressively dropped columns */}
          <table className="w-full border-collapse text-left text-data">
            <thead className="sticky top-11 z-20 bg-paper/95 backdrop-blur-xs border-b border-rule-strong text-xs font-medium uppercase tracking-wider text-ink">
              <tr>
                <th scope="col" className="py-3 pr-4 pl-2 font-medium">
                  Year
                </th>
                <th scope="col" className="py-3 px-4 font-medium">
                  Project
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell py-3 px-4 font-medium"
                >
                  Made at
                </th>
                <th
                  scope="col"
                  className="hidden lg:table-cell py-3 px-4 font-medium"
                >
                  Built with
                </th>
                <th scope="col" className="py-3 pl-4 pr-2 font-medium">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule font-display">
              {projects.map((project) => {
                const year = new Date(project.started_on).getFullYear()
                const links = Array.isArray(project.links)
                  ? (project.links as any[])
                  : []
                const liveLink = links.find((l) => l.kind === 'live') || links[0]

                return (
                  <tr
                    key={project.id}
                    className="group hover:bg-rule/30 transition-colors"
                  >
                    {/* Year */}
                    <td className="py-4 pr-4 pl-2 tabular-nums text-graphite font-normal text-xs align-top">
                      {year}
                    </td>

                    {/* Project Title with link to case study */}
                    <td className="py-4 px-4 font-medium text-ink align-top">
                      <Link
                        href={`/work/${project.slug}`}
                        className="hover:text-signal transition-colors inline-block"
                      >
                        {project.title}
                      </Link>
                    </td>

                    {/* Made at (Dropped on < md) */}
                    <td className="hidden md:table-cell py-4 px-4 text-ink/80 text-xs align-top">
                      {project.client_name || '—'}
                    </td>

                    {/* Built with (Dropped on < lg) */}
                    <td className="hidden lg:table-cell py-4 px-4 align-top">
                      {project.tech && project.tech.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {project.tech.map((t) => (
                            <span
                              key={t.id}
                              className="rounded-xs bg-rule/50 px-2 py-0.5 text-xs text-ink/90 border border-rule/70"
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-graphite">—</span>
                      )}
                    </td>

                    {/* External Link or Case Study Link */}
                    <td className="py-4 pl-4 pr-2 align-top text-xs">
                      {liveLink ? (
                        <a
                          href={liveLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-signal hover:underline inline-flex items-center"
                        >
                          {liveLink.label || 'View'}
                        </a>
                      ) : (
                        <Link
                          href={`/work/${project.slug}`}
                          className="font-medium text-ink hover:text-signal transition-colors"
                        >
                          Case study
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
