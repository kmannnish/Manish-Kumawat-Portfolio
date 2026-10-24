import { Instrument_Sans, Newsreader } from 'next/font/google'

import './globals.css'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-newsreader',
  // The opsz axis is the entire reason this face was chosen (docs/02 §2).
  // next/font subsets away every axis you don't ask for, so without this line
  // we ship a variable serif stripped of the one feature it was picked for.
  // It also rejects `axes` alongside a fixed `weight` — hence no weight here,
  // which keeps the full variable range available.
  axes: ['opsz'],
})

import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/queries'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const title = settings?.seo_title || `${settings?.owner_name || 'Manish Kumawat'} — ${settings?.role_title || 'Forward Deployed AI Engineer & Designer'}`
  const description = settings?.seo_description || settings?.tagline || 'Forward Deployed AI Engineer & Designer'

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://manishkumawat.com'),
    title: {
      default: title,
      template: `%s | ${settings?.owner_name || 'Manish Kumawat'}`,
    },
    description,
  }
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${newsreader.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
