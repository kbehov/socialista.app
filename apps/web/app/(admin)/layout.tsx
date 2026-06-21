import { auth } from '@/auth'
import { AdminSidebar } from '@/components/admin-sidebar'
import { UserDropdown } from '@/components/common/user-dropdown'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="flex min-h-svh flex-col bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4  flex-row justify-between">
          <SidebarTrigger className="-ml-1" />
          <UserDropdown />
        </header>

        <main className="flex flex-1 flex-col overflow-auto mx-auto  w-full container  gap-10 px-6 py-4 lg:py-5 max-w-7xl">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
