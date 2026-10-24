import type { TechGroup } from '@/lib/queries'
import { t, type CopyMap } from '@/lib/copy'

interface SkillsProps {
  groups: TechGroup[]
  copy: CopyMap
}

export function Skills({ groups, copy }: SkillsProps) {
  const title = t(copy, 'skills.title', 'Technologies & Disciplines')

  if (groups.length === 0) {
    return null
  }

  return (
    <section id="skills" aria-label="Skills" className="py-12 lg:py-16 text-left">
      <h2 className="text-h2 font-medium text-ink tracking-tight mb-8">
        {title}
      </h2>

      {/* Grouped by category, no progress bars, no star ratings, no radar charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl">
        {groups.map((group) => (
          <div key={group.category} className="space-y-3">
            <h3 className="text-xs font-display uppercase tracking-wider text-graphite font-medium">
              {group.label}
            </h3>
            <ul className="space-y-1.5 font-display text-data">
              {group.items.map((tech) => (
                <li
                  key={tech.id}
                  className="flex items-center justify-between"
                >
                  {/* Featured skills distinguished typographically (medium weight + darker ink) */}
                  <span
                    className={
                      tech.is_featured
                        ? 'font-medium text-ink text-sm'
                        : 'font-normal text-ink/80 text-xs'
                    }
                  >
                    {tech.name}
                  </span>
                  {tech.is_featured && (
                    <span
                      className="size-1 rounded-full bg-signal shrink-0 ml-2"
                      title="Core discipline"
                      aria-hidden="true"
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
