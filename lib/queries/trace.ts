import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export interface TraceItem {
  id: string
  kind: 'experience' | 'project'
  organization: string
  role: string
  startedOn: string // YYYY-MM-DD
  endedOn: string | null // null indicates ongoing
  accentColor: string
  isLatestOngoing: boolean
  summary: string | null
  highlights?: Array<{ text: string }> | null
  metrics?: Array<{
    label: string
    before?: string
    after?: string
    unit?: string
    is_headline?: boolean
  }> | null
  slug?: string | null
  startPercent: number
  widthPercent: number
}

export interface TraceData {
  items: TraceItem[]
  minYear: number
  maxYear: number
  years: number[]
}

const CURATED_ACCENTS = [
  '#1C6B52', // deep green
  '#4A5A1E', // olive
  '#8A4B1F', // burnt umber
  '#5B3FA8', // violet
  '#A8321C', // brick
  '#2B6A8F', // steel blue
]

export const getTraceData = cache(async (): Promise<TraceData> => {
  try {
    const supabase = await createClient()

    // 1. Fetch visible experience rows
    const { data: expData, error: expError } = await supabase
      .from('experience')
      .select('*')
      .eq('is_visible', true)
      .order('started_on', { ascending: true })

    if (expError) {
      console.error('[queries/trace] experience error:', expError.message)
    }

    // 2. Fetch featured published projects
    const { data: projData, error: projError } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('started_on', { ascending: true })

    if (projError) {
      console.error('[queries/trace] projects error:', projError.message)
    }

    const rawItems: Array<{
      id: string
      kind: 'experience' | 'project'
      organization: string
      role: string
      startedOn: string
      endedOn: string | null
      accentColor: string | null
      summary: string | null
      highlights?: Array<{ text: string }> | null
      metrics?: Array<{
        label: string
        before?: string
        after?: string
        unit?: string
        is_headline?: boolean
      }> | null
      slug?: string | null
    }> = []

    if (expData) {
      for (const e of expData) {
        rawItems.push({
          id: e.id,
          kind: 'experience',
          organization: e.organization,
          role: e.role,
          startedOn: e.started_on,
          endedOn: e.ended_on,
          accentColor: e.accent_color,
          summary: e.summary,
          highlights: (e.highlights as Array<{ text: string }>) || null,
        })
      }
    }

    if (projData) {
      for (const p of projData) {
        rawItems.push({
          id: p.id,
          kind: 'project',
          organization: p.title,
          role: p.role || 'Project',
          startedOn: p.started_on,
          endedOn: p.ended_on,
          accentColor: p.accent_color,
          summary: p.summary,
          slug: p.slug,
          metrics:
            (p.metrics as Array<{
              label: string
              before?: string
              after?: string
              unit?: string
              is_headline?: boolean
            }>) || null,
        })
      }
    }

    if (rawItems.length === 0) {
      const currentYear = new Date().getFullYear()
      return {
        items: [],
        minYear: currentYear - 2,
        maxYear: currentYear,
        years: [currentYear - 2, currentYear - 1, currentYear],
      }
    }

    // Sort by startedOn ascending
    rawItems.sort(
      (a, b) => new Date(a.startedOn).getTime() - new Date(b.startedOn).getTime()
    )

    // Find the latest-starting ongoing row (endedOn is null)
    let latestOngoingId: string | null = null
    let latestOngoingStart = -Infinity

    for (const item of rawItems) {
      if (!item.endedOn) {
        const startTime = new Date(item.startedOn).getTime()
        if (startTime > latestOngoingStart) {
          latestOngoingStart = startTime
          latestOngoingId = item.id
        }
      }
    }

    // Determine time bounds
    const nowTime = new Date().getTime()
    let minTime = Infinity
    let maxTime = nowTime

    for (const item of rawItems) {
      const s = new Date(item.startedOn).getTime()
      if (s < minTime) minTime = s
      if (item.endedOn) {
        const e = new Date(item.endedOn).getTime()
        if (e > maxTime) maxTime = e
      }
    }

    // Align bounds to year starts/ends for clean axis marks
    const minDateObj = new Date(minTime)
    const maxDateObj = new Date(maxTime)
    const minYear = minDateObj.getFullYear()
    const maxYear = maxDateObj.getFullYear() + 1

    const axisStartTime = new Date(`${minYear}-01-01`).getTime()
    const axisEndTime = new Date(`${maxYear}-01-01`).getTime()
    const totalDuration = axisEndTime - axisStartTime

    const years: number[] = []
    for (let y = minYear; y <= maxYear; y++) {
      years.push(y)
    }

    // Map each item with percentages and colors
    const items: TraceItem[] = rawItems.map((item, idx) => {
      const sTime = new Date(item.startedOn).getTime()
      const eTime = item.endedOn ? new Date(item.endedOn).getTime() : nowTime

      const startPercent = Math.max(
        0,
        Math.min(100, ((sTime - axisStartTime) / totalDuration) * 100)
      )
      const rawWidth = Math.max(
        1.5,
        Math.min(100 - startPercent, ((eTime - sTime) / totalDuration) * 100)
      )

      const fallbackAccent = CURATED_ACCENTS[idx % CURATED_ACCENTS.length]
      const accentColor = item.accentColor || fallbackAccent
      const isLatestOngoing = item.id === latestOngoingId

      return {
        ...item,
        accentColor,
        isLatestOngoing,
        startPercent,
        widthPercent: rawWidth,
      }
    })

    return {
      items,
      minYear,
      maxYear,
      years,
    }
  } catch (err) {
    console.error('[queries/trace] unexpected error:', err)
    const currentYear = new Date().getFullYear()
    return {
      items: [],
      minYear: currentYear - 2,
      maxYear: currentYear,
      years: [currentYear - 2, currentYear - 1, currentYear],
    }
  }
})
