import { dashboardMainClassName } from '@/components/dashboard/studio-shell'
import DashboardHeader from '@/components/headers/dashboard-header'
import { PageScrollCompactProvider } from '@/components/headers/page-scroll-compact'
import { AppSidebar } from '@/components/sidebars/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { WorkspaceProvider } from '@/context/workspace-provider'
import { getDashboardData } from '@/services/dashboard.service'
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, workspaces, aiCreditsBalance } = await getDashboardData()

  const user = {
    name: session.user?.name ?? 'User',
    email: session.user?.email ?? '',
    avatar: session.user?.image ?? '',
  }

  return (
    <WorkspaceProvider workspaces={workspaces}>
      <SidebarProvider className="h-svh max-h-svh overflow-hidden">
        <AppSidebar workspaces={workspaces} user={user} />
        <SidebarInset className="flex h-svh max-h-svh min-w-0 flex-1 flex-col overflow-hidden bg-background">
          <DashboardHeader workspaceBalance={aiCreditsBalance} />
          <main
            id="dashboard-scroll"
            data-dashboard-scroll
            className={dashboardMainClassName}
          >
            <PageScrollCompactProvider>{children}</PageScrollCompactProvider>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </WorkspaceProvider>
  )
}
