interface AdminHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function AdminHeader({ title, description, action }: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-rule font-display mb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs text-graphite">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
