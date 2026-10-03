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

// No `metadata` export yet, deliberately. Every user-facing string resolves
// from the `copy` table or `site_settings` (law #1), neither of which exists
// until S2 — and a placeholder title here would be exactly the hardcoded
// string the law forbids. S9 builds real metadata from site_settings.

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
