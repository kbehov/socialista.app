import { auth } from '@/auth'
import { AppSidebar } from '@/components/app-sidebar'
import DashboardHeader from '@/components/dashboard/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
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
      <SidebarProvider className="h-svh max-h-svh overflow-hidden">
        <AppSidebar
          workspaces={workspaces.data ?? []}
          user={{
            name: session.user?.name ?? 'User',
            email: session.user?.email ?? '',
            avatar: session.user?.image ?? '',
          }}
        />
        <SidebarInset className="flex h-svh max-h-svh min-w-0 flex-1 flex-col overflow-hidden bg-background">
          <DashboardHeader />

          <main className="mx-auto flex min-h-0 w-full min-w-0 max-w-7xl flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto px-4 py-6 lg:px-6 [&:has(.studio-shell,.video-studio,.slideshow-studio)]:mx-0 [&:has(.studio-shell,.video-studio,.slideshow-studio)]:max-w-none [&:has(.studio-shell,.video-studio,.slideshow-studio)]:gap-0 [&:has(.studio-shell,.video-studio,.slideshow-studio)]:overflow-hidden [&:has(.studio-shell,.video-studio,.slideshow-studio)]:p-0">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </WorkspaceProvider>
  )
}
