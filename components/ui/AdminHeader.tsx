import Link from 'next/link'

interface AdminHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  backHref?: string
  backLabel?: string
}

export function AdminHeader({
  title,
  description,
  action,
  backHref,
  backLabel,
}: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-rule font-display mb-8">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs text-graphite hover:text-ink transition-colors mb-2.5 font-medium group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>{backLabel || 'Back'}</span>
          </Link>
        )}
        <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs text-graphite">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 sm:pt-1">{action}</div>}
    </div>
  )
}
