import Link from 'next/link'
import type { PostRow } from '@/lib/queries'
import { t, type CopyMap } from '@/lib/copy'

interface WritingProps {
  posts: PostRow[]
  copy: CopyMap
}

function formatDate(isoStr: string | null): string {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export function Writing({ posts, copy }: WritingProps) {
  const title = t(copy, 'writing.title', 'Writing')
  const emptyLabel = t(copy, 'writing.empty', 'No articles published yet.')

  return (
    <section id="writing" aria-label="Writing" className="py-12 lg:py-16 text-left">
      <h2 className="text-h2 font-medium text-ink tracking-tight mb-8">
        {title}
      </h2>

      {posts.length === 0 ? (
        <p className="text-data text-graphite font-prose italic">{emptyLabel}</p>
      ) : (
        <ol className="space-y-8 max-w-prose">
          {posts.map((post) => {
            const dateStr = formatDate(post.published_at)

            return (
              <li key={post.id} className="group space-y-1.5">
                <div className="flex items-baseline justify-between gap-4 text-xs font-display tabular-nums text-graphite">
                  <span>{dateStr}</span>
                  {post.reading_minutes ? (
                    <span>{post.reading_minutes} min read</span>
                  ) : null}
                </div>

                <h3 className="text-h3 font-medium text-ink">
                  <Link
                    href={`/writing/${post.slug}`}
                    className="hover:text-signal transition-colors inline-block"
                  >
                    {post.title}
                  </Link>
                </h3>

                {post.excerpt && (
                  <p className="font-prose text-sm text-ink/85 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
