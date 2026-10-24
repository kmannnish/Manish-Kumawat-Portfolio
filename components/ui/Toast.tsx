'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const success = useCallback((msg: string) => addToast(msg, 'success'), [addToast])
  const error = useCallback((msg: string) => addToast(msg, 'error'), [addToast])
  const info = useCallback((msg: string) => addToast(msg, 'info'), [addToast])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none"
      >
        {toasts.map((toast) => {
          const isError = toast.type === 'error'
          const isSuccess = toast.type === 'success'

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xs border shadow-sm font-display text-xs text-ink bg-paper transition-all ${
                isError
                  ? 'border-mark bg-mark/5'
                  : isSuccess
                  ? 'border-signal bg-signal/5'
                  : 'border-rule-strong'
              }`}
            >
              <span>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-graphite hover:text-ink cursor-pointer text-sm leading-none p-0.5"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
