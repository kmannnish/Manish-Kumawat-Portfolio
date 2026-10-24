import Link from 'next/link'
import Image from 'next/image'
import type { ProjectWithTech } from '@/lib/queries'
import { t, type CopyMap } from '@/lib/copy'
import { MorphDotsToText } from '@/components/ui/MorphDotsToText'

interface DesignProps {
  projects: ProjectWithTech[]
  copy: CopyMap
}

export function Design({ projects, copy }: DesignProps) {
  const title = t(copy, 'nav.design', 'Design & Art Direction')
  const designProjects = projects.filter((p) => p.show_in_design_section)

  return (
    <section id="design" aria-label="Design work" className="py-12 lg:py-16 text-left space-y-8">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-h2 font-medium text-ink tracking-tight">
            {title}
          </h2>
          <p className="text-graphite text-xs sm:text-sm mt-1 font-display">
            Graphic systems, event stage architecture, brand identity & interactive motion
          </p>
        </div>
        <Link
          href="/design"
          className="text-xs text-graphite hover:text-signal transition-colors font-display font-medium"
        >
          View all design &rarr;
        </Link>
      </div>

      {/* ── JITTER INSPIRATION: MORPH DOTS TO TEXT ANIMATION ── */}
      <div className="w-full">
        <MorphDotsToText
          words={['DESIGN', 'SYSTEMS', 'CRAFT', 'AI & ART']}
          height={180}
        />
      </div>

      {/* ── SPOTLIGHT DUAL PROFILE: CREATIVE DESIGNER & BUILDER ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-xs border border-rule bg-rule/20 backdrop-blur-xs">
        {/* Left: Designer Portrait */}
        <div className="relative aspect-4/5 md:aspect-auto h-64 md:h-full rounded-xs overflow-hidden border border-rule">
          <Image
            src="/portraits/designer.webp"
            alt="Manish Kumawat — Creative Designer & Art Director"
            fill
            className="object-cover object-top hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 right-3 text-paper">
            <span className="text-xxs font-mono uppercase tracking-wider text-paper/80 block">
              Identity & Stage Craft
            </span>
            <span className="text-xs font-semibold">Manish Kumawat</span>
          </div>
        </div>

        {/* Right: Design Philosophy & Impact */}
        <div className="md:col-span-2 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-signal/10 border border-signal/20 text-signal text-xxs font-mono uppercase tracking-wider">
              <span>● Hybrid Practice</span>
            </div>
            <h3 className="text-lg font-medium tracking-tight text-ink">
              Design is not decoration — it is how complex technical systems earn user trust.
            </h3>
            <p className="font-prose text-sm text-ink/85 leading-relaxed">
              Before engineering AI pipelines, I spent years crafting brand languages, stage environments for thousands of attendees, and physical exhibition print systems. That tactile rigor informs every interface, data visualization, and token system I build today.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-rule/60 text-xxs font-mono">
            <div>
              <span className="text-graphite block">BRAND & IDENTITY</span>
              <span className="text-ink font-semibold">4+ Full Systems</span>
            </div>
            <div>
              <span className="text-graphite block">STAGE & EXHIBITION</span>
              <span className="text-ink font-semibold">Large Scale Print</span>
            </div>
            <div>
              <span className="text-graphite block">VIDEO & MOTION</span>
              <span className="text-ink font-semibold">50+ Edited Cuts</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── DESIGN SYSTEMS & CASE STUDIES ── */}
      {designProjects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {designProjects.map((project) => (
            <Link
              key={project.id}
              href={`/work/${project.slug}`}
              className="group relative block p-5 rounded-xs border border-rule hover:border-rule-strong bg-rule/10 hover:bg-rule/30 transition-all overflow-hidden"
            >
              {/* Negative mask hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                style={{ backgroundColor: project.accent_color || '#2743E8' }}
              />

              <div className="flex items-baseline justify-between mb-2 relative z-10">
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
                <p className="font-prose text-sm text-ink/85 leading-relaxed line-clamp-2 mb-4 relative z-10">
                  {project.summary}
                </p>
              )}

              {project.tech && project.tech.length > 0 && (
                <div className="flex flex-wrap gap-1 relative z-10">
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
      )}
    </section>
  )
}
