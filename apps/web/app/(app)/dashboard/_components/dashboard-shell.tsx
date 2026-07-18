import DashboardHeader from '@/components/headers/dashboard-header'
import { AppSidebar } from '@/components/sidebars/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { WorkspaceProvider } from '@/context/workspace-provider'
import type { WorkspaceResponse } from '@socialista/types'
import { DashboardMain } from './dashboard-main'

type DashboardShellProps = {
  workspaces: WorkspaceResponse[]
  aiCreditsBalance: number
  user: {
    name: string
    email: string
    avatar: string
  }
  children: React.ReactNode
}

export function DashboardShell({
  workspaces,
  aiCreditsBalance,
  user,
  children,
}: DashboardShellProps) {
  return (
    <WorkspaceProvider workspaces={workspaces}>
      <SidebarProvider className="h-svh max-h-svh overflow-hidden">
        <AppSidebar workspaces={workspaces} user={user} />
        <SidebarInset className="flex h-svh max-h-svh min-w-0 flex-1 flex-col overflow-hidden bg-background">
          <DashboardHeader workspaceBalance={aiCreditsBalance} />
          <DashboardMain>{children}</DashboardMain>
        </SidebarInset>
      </SidebarProvider>
    </WorkspaceProvider>
  )
}
