import { AdminSidebar } from '@/components/ui/AdminSidebar'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-paper">
      {/* Admin Sidebar (Desktop & Mobile) */}
      <AdminSidebar />

      {/* Main Admin Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
