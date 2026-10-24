import type { TestimonialRow } from '@/lib/queries'
import { t, type CopyMap } from '@/lib/copy'

interface TestimonialsProps {
  testimonials: TestimonialRow[]
  copy: CopyMap
}

export function Testimonials({ testimonials, copy }: TestimonialsProps) {
  const title = t(copy, 'testimonials.title', 'Testimonials')

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section
      id="testimonials"
      aria-label="Testimonials"
      className="py-12 lg:py-16 text-left"
    >
      <h2 className="text-h2 font-medium text-ink tracking-tight mb-8">
        {title}
      </h2>

      {/* Plain blockquotes, no carousel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        {testimonials.map((t) => (
          <blockquote
            key={t.id}
            className="flex flex-col justify-between border-l-2 border-rule-strong pl-6 py-1 space-y-4"
          >
            <p className="font-prose text-body text-ink/95 leading-relaxed italic">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer className="font-display">
              <cite className="not-italic block font-medium text-ink text-sm">
                {t.author_name}
              </cite>
              {(t.author_role || t.author_org) && (
                <span className="text-xs text-graphite block">
                  {[t.author_role, t.author_org].filter(Boolean).join(', ')}
                </span>
              )}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}
