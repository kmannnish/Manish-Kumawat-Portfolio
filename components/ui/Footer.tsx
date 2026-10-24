import { t, type CopyMap } from '@/lib/copy'

interface FooterProps {
  lastUpdated: string | null
  copy: CopyMap
}

function formatDate(isoString: string | null): string {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  } catch {
    return ''
  }
}

export function Footer({ lastUpdated, copy }: FooterProps) {
  const formattedDate = formatDate(lastUpdated)
  const lastUpdatedLabel = t(copy, 'footer.last_updated', 'Last updated')
  const builtWithLabel = t(copy, 'footer.built_with', 'Built with Next.js & Supabase')

  return (
    <footer className="w-full border-t border-rule py-10 mt-20 text-data text-graphite">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <span>{builtWithLabel}</span>
        </div>
        {formattedDate ? (
          <div className="flex items-center gap-2">
            <span>{lastUpdatedLabel}:</span>
            {/* Permitted use #3 for --mark: the last-updated stamp */}
            <time
              dateTime={lastUpdated || undefined}
              className="font-medium tabular-nums text-mark"
            >
              {formattedDate}
            </time>
          </div>
        ) : null}
      </div>
    </footer>
  )
}
