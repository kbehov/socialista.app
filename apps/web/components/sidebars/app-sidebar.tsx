'use client'

import { NavMain } from '@/components/sidebars/nav-main'
import { NavUser } from '@/components/sidebars/nav-user'
import { SidebarCreateAction } from '@/components/sidebars/sidebar-create-action'
import { SidebarStorageFooter } from '@/components/sidebars/sidebar-storage-footer'
import { SidebarUpgradeCard } from '@/components/sidebars/sidebar-upgrade-card'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { TeamSwitcher } from '@/components/workspace-switcher'
import { WorkspaceResponse } from '@socialista/types'
import {
  FolderArchiveIcon,
  ImagesIcon,
  LayersIcon,
  LayoutDashboardIcon,
  ShoppingBagIcon,
  VideoIcon,
} from 'lucide-react'
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

const iconProps = { className: 'nav-icon size-4 shrink-0', strokeWidth: 1.75 } as const

function isStudioRoute(pathname: string, segment: string) {
  return pathname === `/dashboard/studio/${segment}` || pathname.startsWith(`/dashboard/studio/${segment}/`)
}

export function AppSidebar({ workspaces, user = defaultUser, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  const studioItems = [
    {
      title: 'Images',
      url: '/dashboard/studio/images',
      icon: <ImagesIcon {...iconProps} />,
      isActive: isStudioRoute(pathname, 'images'),
    },
    {
      title: 'Slideshows',
      url: '/dashboard/studio/slideshows',
      icon: <LayersIcon {...iconProps} />,
      isActive: isStudioRoute(pathname, 'slideshows'),
    },
    {
      title: 'Videos',
      url: '/dashboard/studio/videos',
      icon: <VideoIcon {...iconProps} />,
      isActive: isStudioRoute(pathname, 'videos'),
    },
  ]

  const workspaceItems = [
    {
      title: 'Files',
      url: '/dashboard/files',
      icon: <FolderArchiveIcon {...iconProps} />,
      isActive: pathname === '/dashboard/files' || pathname.startsWith('/dashboard/files/'),
    },
    {
      title: 'Products',
      url: '/dashboard/products',
      icon: <ShoppingBagIcon {...iconProps} />,
      isActive: pathname === '/dashboard/products' || pathname.startsWith('/dashboard/products/'),
    },
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: <LayoutDashboardIcon {...iconProps} />,
      isActive: pathname === '/dashboard',
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pb-0">
        <TeamSwitcher workspaces={workspaces} />
      </SidebarHeader>

      <SidebarContent className="sidebar-scrollbar gap-0">
        <SidebarCreateAction />
        <NavMain items={studioItems} sectionTitle="Studio" />
        <NavMain items={workspaceItems} sectionTitle="Workspace" />
      </SidebarContent>

      <SidebarFooter className="gap-1 border-t border-sidebar-border pt-2">
        <SidebarUpgradeCard />
        <SidebarStorageFooter />
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
