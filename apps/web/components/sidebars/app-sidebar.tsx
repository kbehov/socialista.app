'use client'

import { NavMain } from '@/components/sidebars/nav-main'
import { NavUser } from '@/components/sidebars/nav-user'
import { SidebarCreateAction } from '@/components/sidebars/sidebar-create-action'
import { SidebarStorageFooter } from '@/components/sidebars/sidebar-storage-footer'
import { SidebarUpgradeCard } from '@/components/sidebars/sidebar-upgrade-card'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { TeamSwitcher } from '@/components/workspace-switcher'
import {
  DASHBOARD_ROUTES,
  isDashboardAccountsPath,
  isDashboardFilesPath,
  isDashboardGenerationsPath,
  isDashboardPostsPath,
  isDashboardProductsPath,
  isStaticAdsPath,
  isStudioImagesPath,
  isStudioSegmentPath,
} from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { WorkspaceResponse } from '@socialista/types'
import {
  FolderArchiveIcon,
  HistoryIcon,
  ImagesIcon,
  LayersIcon,
  LayoutDashboardIcon,
  Link2Icon,
  MegaphoneIcon,
  SendIcon,
  ShoppingBagIcon,
  VideoIcon,
  type LucideIcon,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  workspaces: WorkspaceResponse[]
  user?: {
    name: string
    email: string
    avatar: string
  }
}

type SidebarNavItem = {
  title: string
  url: string
  icon: React.ReactNode
  isActive: boolean
}

const defaultUser = {
  name: 'User',
  email: '',
  avatar: '',
}

const iconClassName = 'nav-icon size-4 shrink-0'

function navIcon(Icon: LucideIcon) {
  return <Icon className={iconClassName} strokeWidth={1.75} />
}

function isStudioRoute(pathname: string, segment: 'images' | 'slideshows' | 'videos') {
  if (segment === 'images') return isStudioImagesPath(pathname)
  return isStudioSegmentPath(pathname, segment)
}

function buildPlatformItems(pathname: string): SidebarNavItem[] {
  return [
    {
      title: 'Dashboard',
      url: DASHBOARD_ROUTES.ROOT,
      icon: navIcon(LayoutDashboardIcon),
      isActive: pathname === DASHBOARD_ROUTES.ROOT,
    },
    {
      title: 'Accounts',
      url: DASHBOARD_ROUTES.ACCOUNTS,
      icon: navIcon(Link2Icon),
      isActive: isDashboardAccountsPath(pathname),
    },
    {
      title: 'Posts',
      url: DASHBOARD_ROUTES.POSTS,
      icon: navIcon(SendIcon),
      isActive: isDashboardPostsPath(pathname),
    },
  ]
}

function buildStudioItems(pathname: string): SidebarNavItem[] {
  return [
    {
      title: 'Images',
      url: DASHBOARD_ROUTES.STUDIO.IMAGES,
      icon: navIcon(ImagesIcon),
      isActive: isStudioRoute(pathname, 'images'),
    },
    {
      title: 'Static ads',
      url: DASHBOARD_ROUTES.STUDIO.STATIC_ADS,
      icon: navIcon(MegaphoneIcon),
      isActive: isStaticAdsPath(pathname),
    },
    {
      title: 'Slideshows',
      url: DASHBOARD_ROUTES.STUDIO.SLIDESHOWS,
      icon: navIcon(LayersIcon),
      isActive: isStudioRoute(pathname, 'slideshows'),
    },
    {
      title: 'Videos',
      url: DASHBOARD_ROUTES.STUDIO.VIDEOS,
      icon: navIcon(VideoIcon),
      isActive: isStudioRoute(pathname, 'videos'),
    },
    {
      title: 'Generations',
      url: DASHBOARD_ROUTES.GENERATIONS,
      icon: navIcon(HistoryIcon),
      isActive: isDashboardGenerationsPath(pathname),
    },
  ]
}

function buildWorkspaceItems(pathname: string): SidebarNavItem[] {
  return [
    {
      title: 'Files',
      url: DASHBOARD_ROUTES.FILES,
      icon: navIcon(FolderArchiveIcon),
      isActive: isDashboardFilesPath(pathname),
    },
    {
      title: 'Products',
      url: DASHBOARD_ROUTES.PRODUCTS,
      icon: navIcon(ShoppingBagIcon),
      isActive: isDashboardProductsPath(pathname),
    },
  ]
}

export function AppSidebar({ workspaces, user = defaultUser, className, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  const platformItems = useMemo(() => buildPlatformItems(pathname), [pathname])
  const studioItems = useMemo(() => buildStudioItems(pathname), [pathname])
  const workspaceItems = useMemo(() => buildWorkspaceItems(pathname), [pathname])

  return (
    <Sidebar collapsible="icon" className={cn(className)} {...props}>
      <SidebarHeader className="h-14 shrink-0 border-b border-sidebar-border px-2 py-2">
        <TeamSwitcher workspaces={workspaces} />
      </SidebarHeader>

      <SidebarContent className="sidebar-scrollbar gap-0 overflow-x-hidden px-0 py-2">
        <SidebarCreateAction />

        <SidebarSeparator className="mx-3 my-1.5 group-data-[collapsible=icon]:hidden" />

        <NavMain items={platformItems} sectionTitle="Overview" className="py-1" />
        <NavMain items={studioItems} sectionTitle="Studio" className="py-1" />
        <NavMain items={workspaceItems} sectionTitle="Workspace" className="py-1" />
      </SidebarContent>

      <SidebarFooter className="shrink-0 gap-1.5 border-t border-sidebar-border bg-sidebar p-2">
        <SidebarUpgradeCard />
        <SidebarStorageFooter />
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
