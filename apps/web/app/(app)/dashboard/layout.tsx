import { auth } from '@/auth'
import { AppSidebar } from '@/components/app-sidebar'
import { UserDropdown } from '@/components/common/user-dropdown'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { WorkspaceProvider } from '@/context/workspace-provider'
import { getUserWorkspaces } from '@/services/workspace.service'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) {
    redirect('/auth/signin')
  }

  const workspaces = await getUserWorkspaces()

  return (
    <WorkspaceProvider workspaces={workspaces.data || []}>
      <SidebarProvider>
        <AppSidebar
          workspaces={workspaces.data ?? []}
          user={{
            name: session.user?.name ?? 'User',
            email: session.user?.email ?? '',
            avatar: session.user?.image ?? '',
          }}
        />
        <SidebarInset className="flex min-h-svh flex-col bg-background">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <UserDropdown />
          </header>

          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 overflow-auto px-4 py-6 lg:px-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </WorkspaceProvider>
  )
}
