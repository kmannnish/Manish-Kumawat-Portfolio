'use client'

import { useState } from 'react'
import type { TraceData, TraceItem } from '@/lib/queries'
import { t, type CopyMap } from '@/lib/copy'

interface TraceProps {
  data: TraceData
  copy: CopyMap
}

function formatYearDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export function Trace({ data, copy }: TraceProps) {
  const { items, minYear, maxYear, years } = data
  const totalYears = maxYear - minYear

  // Default selected item is the latest ongoing item or first item
  const initialItem = items.find((i) => i.isLatestOngoing) || items[0] || null
  const [selectedItem, setSelectedItem] = useState<TraceItem | null>(initialItem)

  const nowLabel = t(copy, 'trace.label.now', 'Now')
  const presentLabel = t(copy, 'trace.label.present', 'Present')

  if (items.length === 0) {
    return null
  }

  return (
    <section
      id="trace"
      aria-label="Deployment trace timeline"
      className="py-12 lg:py-16 text-left"
    >
      {/* ──────────────────────────────────────────────────────────────────
          DESKTOP (lg+): Horizontal duration bars with shared time axis
          ────────────────────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        {/* Time Axis Header */}
        <div className="flex border-b border-rule-strong pb-2 text-xs font-display tabular-nums text-ink/70">
          <div className="w-64 shrink-0 font-medium uppercase tracking-wider text-ink/80">
            Engagement
          </div>
          <div className="relative flex-1">
            <div className="flex justify-between w-full">
              {years.map((year, idx) => (
                <div
                  key={year}
                  className="flex flex-col items-center"
                  style={{
                    position: idx === 0 ? 'relative' : 'absolute',
                    left:
                      idx === 0
                        ? undefined
                        : `${((year - minYear) / totalYears) * 100}%`,
                    transform: idx === 0 ? undefined : 'translateX(-50%)',
                  }}
                >
                  <span>{year}</span>
                  <div className="h-1.5 w-px bg-rule-strong mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Rows Container with Hover-Dimming (opacity-70) */}
        <div
          className="group/trace relative py-4 space-y-4"
          role="region"
          aria-label="Career trace waterfall"
        >
          {/* Vertical Gridlines across all rows */}
          <div
            className="pointer-events-none absolute inset-y-0 left-64 right-0 flex"
            aria-hidden="true"
          >
            {years.map((year, idx) => {
              if (idx === 0) return null
              const leftPercent = ((year - minYear) / totalYears) * 100
              return (
                <div
                  key={year}
                  className="absolute top-0 bottom-0 w-px border-l border-rule-strong/40"
                  style={{ left: `${leftPercent}%` }}
                />
              )
            })}
          </div>

          {/* Trace Rows */}
          {items.map((item, index) => {
            const isSelected = selectedItem?.id === item.id
            const isOngoing = !item.endedOn

            return (
              <div
                key={item.id}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`${item.organization}, ${item.role} from ${item.startedOn} to ${item.endedOn || presentLabel}`}
                onMouseEnter={() => setSelectedItem(item)}
                onFocus={() => setSelectedItem(item)}
                onClick={() => setSelectedItem(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedItem(item)
                  }
                }}
                className={`group/row relative flex items-center h-10 cursor-pointer rounded-xs transition-opacity duration-150 outline-hidden focus-visible:ring-2 focus-visible:ring-signal group-hover/trace:opacity-70 hover:!opacity-100 focus-within:!opacity-100 ${
                  isSelected ? '!opacity-100' : ''
                }`}
              >
                {/* Left Label: Type-differentiated columns (Org in medium, Role in normal).
                    STRICT RULE: All text inside dimmable row is --ink, NEVER --graphite */}
                <div className="w-64 shrink-0 pr-4 truncate">
                  <span className="font-medium text-ink text-sm block truncate">
                    {item.organization}
                  </span>
                  <span className="font-normal text-xs text-ink/80 block truncate">
                    {item.role}
                  </span>
                </div>

                {/* Timeline Bar Track */}
                <div className="relative flex-1 h-6 flex items-center">
                  <div
                    className={`relative h-5 rounded-xs animate-trace-grow flex items-center transition-all ${
                      item.isLatestOngoing ? 'bg-mark ring-1 ring-mark/30' : ''
                    }`}
                    style={{
                      left: `${item.startPercent}%`,
                      width: `${item.widthPercent}%`,
                      minWidth: '14px',
                      backgroundColor: item.isLatestOngoing
                        ? undefined
                        : item.accentColor,
                      animationDelay: `${index * 40}ms`,
                    }}
                  >
                    {/* Permitted use #1 of --mark: latest ongoing marker ◆ */}
                    {item.isLatestOngoing && isOngoing && (
                      <span
                        className="absolute -right-2 text-mark text-xs font-bold leading-none select-none drop-shadow-xs"
                        title={nowLabel}
                        aria-hidden="true"
                      >
                        ◆
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          MOBILE (< lg): Vertical duration timeline along left axis
          ────────────────────────────────────────────────────────────────── */}
      <div className="block lg:hidden">
        <div className="relative border-l-2 border-rule-strong pl-6 space-y-8 ml-2">
          {items.map((item, index) => {
            const isSelected = selectedItem?.id === item.id
            const isOngoing = !item.endedOn

            return (
              <div
                key={item.id}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedItem(item)}
                onFocus={() => setSelectedItem(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedItem(item)
                  }
                }}
                className={`relative cursor-pointer transition-opacity outline-hidden focus-visible:ring-2 focus-visible:ring-signal ${
                  isSelected ? 'opacity-100' : 'opacity-85 hover:opacity-100'
                }`}
              >
                {/* Left axis node indicator */}
                <span
                  className={`absolute -left-[31px] top-1.5 size-3 rounded-full border-2 border-paper transition-transform ${
                    item.isLatestOngoing
                      ? 'bg-mark scale-110 ring-2 ring-mark/40'
                      : ''
                  }`}
                  style={{
                    backgroundColor: item.isLatestOngoing
                      ? undefined
                      : item.accentColor,
                  }}
                  aria-hidden="true"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink text-base">
                      {item.organization}
                    </span>
                    {item.isLatestOngoing && isOngoing && (
                      <span className="text-mark text-xs font-semibold">
                        ◆ {nowLabel}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-ink/80 font-normal">
                    {item.role}
                  </div>

                  <div className="text-xs tabular-nums text-graphite font-display pt-0.5">
                    {formatYearDate(item.startedOn)} —{' '}
                    {item.endedOn ? formatYearDate(item.endedOn) : presentLabel}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          DETAIL PANEL: Synced to hovered or focused bar
          ────────────────────────────────────────────────────────────────── */}
      {selectedItem && (
        <div
          className="mt-8 border-t border-rule pt-6 transition-all duration-150"
          aria-live="polite"
        >
          <div className="max-w-prose space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div>
                <h2 className="text-h3 font-medium text-ink inline">
                  {selectedItem.organization}
                </h2>
                <span className="ml-3 text-sm font-normal text-graphite">
                  {selectedItem.role}
                </span>
              </div>
              <div className="text-xs font-display tabular-nums text-graphite">
                {formatYearDate(selectedItem.startedOn)} —{' '}
                {selectedItem.endedOn
                  ? formatYearDate(selectedItem.endedOn)
                  : presentLabel}
              </div>
            </div>

            {selectedItem.summary && (
              <p className="font-prose text-body text-ink/90 leading-relaxed">
                {selectedItem.summary}
              </p>
            )}

            {/* If item has highlights (e.g. from experience) */}
            {selectedItem.highlights && selectedItem.highlights.length > 0 && (
              <ul className="space-y-1.5 pt-1 text-sm text-ink/85">
                {selectedItem.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rule-strong select-none mt-1">—</span>
                    <span>{h.text}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* If item has metrics (e.g. from projects) */}
            {selectedItem.metrics && selectedItem.metrics.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-2">
                {selectedItem.metrics.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-baseline gap-2 text-xs font-display tabular-nums text-ink"
                  >
                    <span className="text-graphite font-normal">{m.label}:</span>
                    <span className="font-medium text-ink">
                      {m.before && `${m.before} → `}
                      {m.after} {m.unit || ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
