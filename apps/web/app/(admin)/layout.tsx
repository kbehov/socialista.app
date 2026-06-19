import { auth } from '@/auth'
import { AdminSidebar } from '@/components/admin-sidebar'
import { Separator } from '@/components/ui/separator'
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
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-xs text-muted-foreground">Admin</span>
        </header>

        <main className="flex flex-1 flex-col overflow-auto">
          <div className="mx-auto flex w-full container flex-1 flex-col gap-10 px-6 py-8 md:px-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
