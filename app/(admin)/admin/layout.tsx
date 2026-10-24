import { ToastProvider } from '@/components/ui/Toast'

export const dynamic = 'force-dynamic'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-paper text-ink selection:bg-signal selection:text-white">
        {children}
      </div>
    </ToastProvider>
  )
}
