'use client'

export const CURATED_ACCENTS = [
  { hex: '#1C6B52', name: 'Deep Green' },
  { hex: '#4A5A1E', name: 'Olive' },
  { hex: '#8A4B1F', name: 'Burnt Umber' },
  { hex: '#5B3FA8', name: 'Violet' },
  { hex: '#A8321C', name: 'Brick' },
  { hex: '#2B6A8F', name: 'Steel Blue' },
]

interface AccentSwatchPickerProps {
  value: string | null
  onChange: (hex: string) => void
  label?: string
}

export function AccentSwatchPicker({
  value,
  onChange,
  label = 'Accent Colour (Curated Graphic Fills)',
}: AccentSwatchPickerProps) {
  return (
    <div className="space-y-2 font-display">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-ink">
          {label}
        </label>
        <span className="text-xxs text-graphite">
          Strict 6-palette swatch (§2 contrast-certified)
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5 items-center">
        {CURATED_ACCENTS.map((swatch) => {
          const isSelected = value?.toLowerCase() === swatch.hex.toLowerCase()
          return (
            <button
              key={swatch.hex}
              type="button"
              onClick={() => onChange(swatch.hex)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-xs border text-xs transition-all cursor-pointer ${
                isSelected
                  ? 'border-signal ring-2 ring-signal/30 font-medium bg-signal/5'
                  : 'border-rule hover:border-rule-strong bg-paper'
              }`}
            >
              <span
                className="w-4 h-4 rounded-xs shrink-0 shadow-xs border border-black/10"
                style={{ backgroundColor: swatch.hex }}
              />
              <span className="text-ink">{swatch.name}</span>
              <span className="text-xxs font-mono text-graphite">{swatch.hex}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
