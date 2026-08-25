'use client'

import { NavMain } from '@/components/sidebars/nav-main'
import { SidebarStorageFooter } from '@/components/sidebars/sidebar-storage-footer'
import { SidebarUpgradeCard } from '@/components/sidebars/sidebar-upgrade-card'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { ProjectSwitcher } from '@/components/project-switcher'
import { TeamSwitcher } from '@/components/workspace-switcher'
import {
  DASHBOARD_ROUTES,
  isDashboardAccountsPath,
  isDashboardContextPath,
  isDashboardFilesPath,
  isDashboardGenerationsPath,
  isDashboardPostsPath,
  isDashboardRootPath,
  isStaticAdsPath,
  isStudioImagesPath,
  isStudioSegmentPath,
} from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import type { ProjectResponse, WorkspaceResponse } from '@socialista/types'
import {
  ChartColumnIcon,
  FolderArchiveIcon,
  HistoryIcon,
  ImagesIcon,
  LayersIcon,
  Link2Icon,
  MegaphoneIcon,
  SendIcon,
  SparklesIcon,
  SmartphoneIcon,
  UserRoundIcon,
  VideoIcon,
  type LucideIcon,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  workspaces: WorkspaceResponse[]
  projects: ProjectResponse[]
}

type SidebarNavItem = {
  title: string
  url: string
  icon: React.ReactNode
  isActive: boolean
}

const iconClassName = 'nav-icon size-3.5 shrink-0'

function navIcon(Icon: LucideIcon) {
  return <Icon className={iconClassName} strokeWidth={1.5} />
}

function isStudioRoute(pathname: string, segment: 'images' | 'slideshows' | 'videos' | 'influencers' | 'ugc') {
  if (segment === 'images') return isStudioImagesPath(pathname)
  return isStudioSegmentPath(pathname, segment)
}

function buildPlatformItems(pathname: string): SidebarNavItem[] {
  return [
    {
      title: 'Analytics',
      url: DASHBOARD_ROUTES.ROOT,
      icon: navIcon(ChartColumnIcon),
      isActive: isDashboardRootPath(pathname),
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
      title: 'Videos',
      url: DASHBOARD_ROUTES.STUDIO.VIDEOS,
      icon: navIcon(VideoIcon),
      isActive: isStudioRoute(pathname, 'videos'),
    },
    {
      title: 'Slideshows',
      url: DASHBOARD_ROUTES.STUDIO.SLIDESHOWS,
      icon: navIcon(LayersIcon),
      isActive: isStudioRoute(pathname, 'slideshows'),
    },
    {
      title: 'Static ads',
      url: DASHBOARD_ROUTES.STUDIO.STATIC_ADS,
      icon: navIcon(MegaphoneIcon),
      isActive: isStaticAdsPath(pathname),
    },
    {
      title: 'Influencers',
      url: DASHBOARD_ROUTES.STUDIO.INFLUENCERS,
      icon: navIcon(UserRoundIcon),
      isActive: isStudioRoute(pathname, 'influencers'),
    },
    {
      title: 'UGC ads',
      url: DASHBOARD_ROUTES.STUDIO.UGC,
      icon: navIcon(SmartphoneIcon),
      isActive: isStudioRoute(pathname, 'ugc'),
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
      title: 'Context & skills',
      url: DASHBOARD_ROUTES.CONTEXT,
      icon: navIcon(SparklesIcon),
      isActive: isDashboardContextPath(pathname),
    },
    {
      title: 'Generations',
      url: DASHBOARD_ROUTES.GENERATIONS,
      icon: navIcon(HistoryIcon),
      isActive: isDashboardGenerationsPath(pathname),
    },
  ]
}

export function AppSidebar({ workspaces, projects, className, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  const platformItems = useMemo(() => buildPlatformItems(pathname), [pathname])
  const studioItems = useMemo(() => buildStudioItems(pathname), [pathname])
  const workspaceItems = useMemo(() => buildWorkspaceItems(pathname), [pathname])

  return (
    <Sidebar collapsible="icon" className={cn(className)} {...props}>
      <SidebarHeader className="h-14 shrink-0 justify-center border-b border-sidebar-separator px-2 py-0">
        <ProjectSwitcher projects={projects} />
      </SidebarHeader>

      <SidebarContent className="sidebar-scrollbar gap-1 overflow-x-hidden px-0 py-2 ">
        <NavMain items={platformItems} sectionTitle="Overview" />
        <NavMain items={studioItems} sectionTitle="Studio" />
        <NavMain items={workspaceItems} sectionTitle="Workspace" />
      </SidebarContent>

      <SidebarFooter className="shrink-0 gap-2 border-t border-sidebar-separator p-2">
        <SidebarUpgradeCard />
        <SidebarStorageFooter />
        <TeamSwitcher workspaces={workspaces} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
