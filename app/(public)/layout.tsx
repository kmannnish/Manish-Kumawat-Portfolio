import type { Metadata } from 'next'
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  const title =
    settings?.seo_title ||
    `${settings?.owner_name || 'Manish Kumawat'} — ${
      settings?.role_title || 'Forward Deployed AI Engineer & Designer'
    }`
  const description =
    settings?.seo_description ||
    settings?.tagline ||
    'Forward Deployed AI Engineer & Designer. Building live AI systems and high-craft interfaces.'

  return {
    title: {
      default: title,
      template: `%s | ${settings?.owner_name || 'Manish Kumawat'}`,
    },
    description,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || 'https://manishkumawat.com'
    ),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

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

  // JSON-LD Person schema
  const socialLinks = Array.isArray(settings?.social_links)
    ? (settings?.social_links as any[])
    : []
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: settings?.owner_name || 'Manish Kumawat',
    jobTitle: settings?.role_title || 'Forward Deployed AI Engineer & Designer',
    description: settings?.tagline || '',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://manishkumawat.com',
    sameAs: socialLinks.map((s) => s.url).filter(Boolean),
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink selection:bg-signal selection:text-white">
      {/* Skip-to-content accessibility link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-signal focus:text-white focus:outline-hidden rounded-xs text-data font-medium ring-2 ring-white"
      >
        Skip to content
      </a>

      {/* JSON-LD Person Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Thin Top Bar with owner name and live 'currently' status */}
      <TopBar settings={settings} copy={copy} />

      {/* 2. Main content area with sticky left index rail */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
        <IndexRail navItems={navItems} />

        <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 py-8 lg:py-12 lg:pl-10 outline-hidden">
          {children}
        </main>
      </div>

      {/* 3. Footer with real last-updated timestamp in --mark token */}
      <Footer lastUpdated={lastUpdated} copy={copy} settings={settings} />
    </div>
  )
}
