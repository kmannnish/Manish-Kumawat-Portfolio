import {
  getCopyMap,
  getSiteSettings,
  getNavItems,
  getContentLastUpdated,
} from '@/lib/queries'
import { TopBar } from '@/components/ui/TopBar'
import { IndexRail } from '@/components/ui/IndexRail'
import { Footer } from '@/components/ui/Footer'

export const dynamic = 'force-dynamic'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [copy, settings, navItems, lastUpdated] = await Promise.all([
    getCopyMap(),
    getSiteSettings(),
    getNavItems(),
    getContentLastUpdated(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink selection:bg-signal selection:text-white">
      {/* 1. Thin Top Bar with owner name and live 'currently' status */}
      <TopBar settings={settings} copy={copy} />

      {/* 2. Main content area with sticky left index rail */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
        <IndexRail navItems={navItems} />

        <main className="flex-1 min-w-0 py-8 lg:py-12 lg:pl-10">
          {children}
        </main>
      </div>

      {/* 3. Footer with real last-updated timestamp in --mark token */}
      <Footer lastUpdated={lastUpdated} copy={copy} />
    </div>
  )
}
