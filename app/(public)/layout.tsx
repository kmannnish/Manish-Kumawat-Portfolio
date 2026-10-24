import type { Metadata } from 'next'
import {
  getCopyMap,
  getSiteSettings,
  getNavItems,
  getContentLastUpdated,
} from '@/lib/queries'
import { TopBar } from '@/components/ui/TopBar'
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

      {/* 1. Sleek top navigation bar */}
      <TopBar settings={settings} copy={copy} navItems={navItems} />

      {/* 2. Full-screen seamless main content area */}
      <main id="main-content" tabIndex={-1} className="w-full flex-1 outline-hidden">
        {children}
      </main>

      {/* 3. Footer with real last-updated timestamp in --mark token */}
      <Footer lastUpdated={lastUpdated} copy={copy} settings={settings} />
    </div>
  )
}
