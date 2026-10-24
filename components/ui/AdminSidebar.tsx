'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ADMIN_NAV = [
  { label: 'Overview', href: '/admin' },
  { label: 'Copy & Content', href: '/admin/copy' },
  { label: 'Sections', href: '/admin/sections' },
  { label: 'Projects', href: '/admin/projects' },
  { label: 'Experience', href: '/admin/experience' },
  { label: 'Media & Files', href: '/admin/media' },
  { label: 'Inquiries Inbox', href: '/admin/inbox' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-60 shrink-0 border-r border-rule bg-paper min-h-screen flex flex-col justify-between py-6 font-display text-data">
      <div className="space-y-6">
        {/* Brand / Title */}
        <div className="px-6">
          <Link href="/admin" className="font-medium text-ink tracking-tight text-base block">
            Admin Console
          </Link>
          <span className="text-xs text-graphite block mt-0.5">Instrument CMS</span>
        </div>

        {/* Navigation list */}
        <nav aria-label="Admin Navigation" className="px-3">
          <ul className="space-y-1">
            {ADMIN_NAV.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-xs text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-signal/10 text-signal border-l-2 border-signal font-semibold'
                        : 'text-ink/80 hover:bg-rule/30 hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom actions: View live site & Sign out */}
      <div className="px-6 pt-6 border-t border-rule space-y-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-graphite hover:text-signal transition-colors block"
        >
          ↗ View public site
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-xs font-medium text-mark hover:underline transition-colors block cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
