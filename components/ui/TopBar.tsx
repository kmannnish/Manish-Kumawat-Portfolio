import type { SiteSettings } from '@/lib/queries'
import { t, type CopyMap } from '@/lib/copy'

interface TopBarProps {
  settings: SiteSettings | null
  copy: CopyMap
}

export function TopBar({ settings, copy }: TopBarProps) {
  const ownerName = settings?.owner_name || ''
  const currently = settings?.currently || ''
  const currentlyPrefix = t(copy, 'topbar.currently', 'Currently')

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rule bg-paper/95 backdrop-blur-xs">
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 text-data">
        <div className="font-medium tracking-tight text-ink">
          {ownerName}
        </div>
        {currently ? (
          <div className="flex items-center gap-2 truncate text-graphite text-xs sm:text-data">
            <span className="text-graphite font-normal">{currentlyPrefix}:</span>
            <span className="truncate font-medium text-ink">{currently}</span>
          </div>
        ) : null}
      </div>
    </header>
  )
}
