import Link from 'next/link'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { createAdminClient } from '@/lib/supabase/admin'
import { getContentLastUpdated } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const lastUpdated = await getContentLastUpdated()

  let projectCount = 0
  let unreadSubmissions = 0
  let copyCount = 0

  try {
    const supabase = createAdminClient()
    const [pRes, sRes, cRes] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new'),
      supabase.from('copy').select('*', { count: 'exact', head: true }),
    ])

    projectCount = pRes.count || 0
    unreadSubmissions = sRes.count || 0
    copyCount = cRes.count || 0
  } catch (err) {
    console.warn('[admin/dashboard] could not fetch live counts:', err)
  }

  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not yet recorded'

  return (
    <div>
      <AdminHeader
        title="Portfolio Overview"
        description="Monitor system status, live metrics, and manage site content."
        action={
          <Link
            href="/admin/projects"
            className="rounded-xs bg-ink px-4 py-2 text-xs font-medium text-paper hover:bg-signal transition-colors inline-block"
          >
            + New Project
          </Link>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 font-display">
        <div className="p-5 rounded-xs border border-rule bg-rule/20 space-y-1">
          <div className="text-xs text-graphite uppercase tracking-wider font-medium">
            Projects
          </div>
          <div className="text-3xl font-medium text-ink tabular-nums">
            {projectCount}
          </div>
          <div className="text-xs text-ink/75 pt-1">
            <Link href="/admin/projects" className="text-signal hover:underline">
              Manage projects →
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-xs border border-rule bg-rule/20 space-y-1">
          <div className="text-xs text-graphite uppercase tracking-wider font-medium">
            New Inquiries
          </div>
          <div
            className={`text-3xl font-medium tabular-nums ${
              unreadSubmissions > 0 ? 'text-mark' : 'text-ink'
            }`}
          >
            {unreadSubmissions}
          </div>
          <div className="text-xs text-ink/75 pt-1">
            <Link href="/admin/inbox" className="text-signal hover:underline">
              View inbox →
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-xs border border-rule bg-rule/20 space-y-1">
          <div className="text-xs text-graphite uppercase tracking-wider font-medium">
            Copy Strings
          </div>
          <div className="text-3xl font-medium text-ink tabular-nums">
            {copyCount}
          </div>
          <div className="text-xs text-ink/75 pt-1">
            <Link href="/admin/copy" className="text-signal hover:underline">
              Edit copy →
            </Link>
          </div>
        </div>
      </div>

      {/* Freshness & Quick Controls */}
      <div className="p-6 rounded-xs border border-rule bg-paper space-y-4 font-display">
        <h2 className="text-base font-medium text-ink">
          Database & System Freshness
        </h2>
        <div className="flex flex-wrap items-baseline gap-4 text-xs">
          <span className="text-graphite">Content last updated:</span>
          <span className="font-medium text-mark tabular-nums">{formattedDate}</span>
        </div>
        <p className="text-xs text-graphite leading-relaxed max-w-prose">
          The public website resolves 100% of its content dynamically from Supabase.
          Updates made in this admin panel update the database and trigger cache revalidation.
        </p>
      </div>
    </div>
  )
}
