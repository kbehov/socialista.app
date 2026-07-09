'use client'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { SidebarStorageFooter } from '@/components/sidebar-storage-footer'
import { SidebarUpgradeCard } from '@/components/sidebar-upgrade-card'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { TeamSwitcher } from '@/components/workspace-switcher'
import { WorkspaceResponse } from '@socialista/types'
import {
  FileTextIcon,
  FolderArchiveIcon,
  ImagesIcon,
  LayoutDashboardIcon,
  LightbulbIcon,
  UserIcon,
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

function isPostsRoute(pathname: string) {
  return pathname === '/dashboard/posts' || pathname.startsWith('/dashboard/posts/')
}

export function AppSidebar({ workspaces, user = defaultUser, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: <LayoutDashboardIcon {...iconProps} />,
      isActive: pathname === '/dashboard',
    },
    {
      title: 'Accounts',
      url: '/dashboard/accounts',
      icon: <UserIcon {...iconProps} />,
      isActive: pathname === '/dashboard/accounts' || pathname.startsWith('/dashboard/accounts/'),
    },
    {
      title: 'Posts',
      url: '/dashboard/posts',
      icon: <FileTextIcon {...iconProps} />,
      items: [
        {
          title: 'Create post',
          url: '/dashboard/posts',
        },
        {
          title: 'All posts',
          url: '/dashboard/posts/all',
        },
        {
          title: 'Scheduled',
          url: '/dashboard/posts/scheduled',
        },
        {
          title: 'Drafts',
          url: '/dashboard/posts/categories',
        },
      ],
      isActive: isPostsRoute(pathname),
    },
  ]

  const studioItems = [
    {
      title: 'Slideshows',
      url: '/dashboard/studio/slideshows',
      icon: <ImagesIcon {...iconProps} />,
      isActive: pathname === '/dashboard/studio/slideshows' || pathname.startsWith('/dashboard/studio/slideshows/'),
    },
    {
      title: 'Video Editor',
      url: '/dashboard/studio/videos',
      icon: <VideoIcon {...iconProps} />,
      isActive: pathname === '/dashboard/studio/videos' || pathname.startsWith('/dashboard/studio/videos/'),
    },
  ]

  const libraryItems = [
    {
      title: 'Inspirations',
      url: '/dashboard/inspirations',
      icon: <LightbulbIcon {...iconProps} />,
      isActive: pathname === '/dashboard/inspirations' || pathname.startsWith('/dashboard/inspirations/'),
    },
    {
      title: 'Files',
      url: '/dashboard/files',
      icon: <FolderArchiveIcon {...iconProps} />,
      isActive: pathname === '/dashboard/files' || pathname.startsWith('/dashboard/files/'),
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pb-0">
        <TeamSwitcher workspaces={workspaces} />
      </SidebarHeader>

      <SidebarContent className="sidebar-scrollbar gap-0">
        {/* <SidebarCreateAction /> */}
        <SidebarSeparator className="mx-2 my-2" />
        <NavMain items={navItems} sectionTitle="Overview" />
        <NavMain items={studioItems} sectionTitle="Studio" />
        <NavMain items={libraryItems} sectionTitle="Library" />
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
