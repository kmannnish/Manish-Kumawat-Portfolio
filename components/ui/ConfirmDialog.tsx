'use client'

import { useEffect } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-xs border border-rule-strong bg-paper p-6 shadow-md font-display space-y-4">
        <div>
          <h3 id="dialog-title" className="text-base font-medium text-ink">
            {title}
          </h3>
          <p className="mt-1 text-xs text-graphite leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-rule">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xs border border-rule px-4 py-2 text-xs font-medium text-ink hover:bg-rule/40 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xs px-4 py-2 text-xs font-medium text-paper transition-colors cursor-pointer ${
              isDestructive
                ? 'bg-mark hover:bg-mark/90'
                : 'bg-signal hover:bg-signal/90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
