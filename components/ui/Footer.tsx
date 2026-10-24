import { t, type CopyMap } from '@/lib/copy'
import type { SiteSettings } from '@/lib/queries'

interface FooterProps {
  lastUpdated: string | null
  copy: CopyMap
  settings?: SiteSettings | null
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

export function Footer({ lastUpdated, copy, settings }: FooterProps) {
  const formattedDate = formatDate(lastUpdated)
  const currentYear = new Date().getFullYear()
  const ownerName = settings?.owner_name || 'Manish Kumawat'
  const defaultCopyright = `© ${currentYear} ${ownerName}. All rights reserved.`
  const copyrightText = t(copy, 'footer.built_with', defaultCopyright)

  // In case the copy table still had the old 'Built with Next.js & Supabase', replace it cleanly
  const displayText =
    !copyrightText || copyrightText.includes('Next.js & Supabase')
      ? defaultCopyright
      : copyrightText

  const lastUpdatedLabel = t(copy, 'footer.last_updated', 'Last updated')

  return (
    <footer className="w-full border-t border-rule py-10 mt-20 text-data text-graphite font-display">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <span>{displayText}</span>
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

