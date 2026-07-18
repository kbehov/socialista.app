'use client'

import { NavMain } from '@/components/sidebars/nav-main'
import { NavUser } from '@/components/sidebars/nav-user'
import { SidebarCreateAction } from '@/components/sidebars/sidebar-create-action'
import { SidebarStorageFooter } from '@/components/sidebars/sidebar-storage-footer'
import { SidebarUpgradeCard } from '@/components/sidebars/sidebar-upgrade-card'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { TeamSwitcher } from '@/components/workspace-switcher'
import {
  DASHBOARD_ROUTES,
  isDashboardFilesPath,
  isDashboardProductsPath,
  isStaticAdsPath,
  isStudioImagesPath,
  isStudioSegmentPath,
} from '@/constants/app-routes'
import { WorkspaceResponse } from '@socialista/types'
import {
  FolderArchiveIcon,
  ImagesIcon,
  LayersIcon,
  LayoutDashboardIcon,
  MegaphoneIcon,
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

function isStudioRoute(pathname: string, segment: 'images' | 'slideshows' | 'videos') {
  if (segment === 'images') return isStudioImagesPath(pathname)
  return isStudioSegmentPath(pathname, segment)
}

export function AppSidebar({ workspaces, user = defaultUser, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  const studioItems = [
    {
      title: 'Images',
      url: DASHBOARD_ROUTES.STUDIO.IMAGES,
      icon: <ImagesIcon {...iconProps} />,
      isActive: isStudioRoute(pathname, 'images'),
    },
    {
      title: 'Static ads',
      url: DASHBOARD_ROUTES.STUDIO.STATIC_ADS,
      icon: <MegaphoneIcon {...iconProps} />,
      isActive: isStaticAdsPath(pathname),
    },
    {
      title: 'Slideshows',
      url: DASHBOARD_ROUTES.STUDIO.SLIDESHOWS,
      icon: <LayersIcon {...iconProps} />,
      isActive: isStudioRoute(pathname, 'slideshows'),
    },
    {
      title: 'Videos',
      url: DASHBOARD_ROUTES.STUDIO.VIDEOS,
      icon: <VideoIcon {...iconProps} />,
      isActive: isStudioRoute(pathname, 'videos'),
    },
  ]

  const workspaceItems = [
    {
      title: 'Files',
      url: DASHBOARD_ROUTES.FILES,
      icon: <FolderArchiveIcon {...iconProps} />,
      isActive: isDashboardFilesPath(pathname),
    },
    {
      title: 'Products',
      url: DASHBOARD_ROUTES.PRODUCTS,
      icon: <ShoppingBagIcon {...iconProps} />,
      isActive: isDashboardProductsPath(pathname),
    },
    {
      title: 'Dashboard',
      url: DASHBOARD_ROUTES.ROOT,
      icon: <LayoutDashboardIcon {...iconProps} />,
      isActive: pathname === DASHBOARD_ROUTES.ROOT,
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
