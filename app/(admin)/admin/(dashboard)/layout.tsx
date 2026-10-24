import { AdminSidebar } from '@/components/ui/AdminSidebar'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Admin Workspace */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
