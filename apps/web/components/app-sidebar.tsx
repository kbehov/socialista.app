'use client'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { SidebarStorageFooter } from '@/components/sidebar-storage-footer'
import { TeamSwitcher } from '@/components/workspace-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { WorkspaceResponse } from '@socialista/types'
import { FolderArchiveIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  workspaces: WorkspaceResponse[]
  user?: {
    name: string
    email: string
    avatar: string
  }
}

const defaultUser = {
  name: 'User',
  email: '',
  avatar: '',
}

export function AppSidebar({ workspaces, user = defaultUser, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      title: 'Files',
      url: DASHBOARD_ROUTES.HOME,
      icon: <FolderArchiveIcon />,
      isActive: pathname === DASHBOARD_ROUTES.HOME || pathname.startsWith('/dashboard/folders'),
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher workspaces={workspaces} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarStorageFooter />
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
