'use client'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { SidebarStorageFooter } from '@/components/sidebar-storage-footer'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { TeamSwitcher } from '@/components/workspace-switcher'
import { WorkspaceResponse } from '@socialista/types'
import { FileTextIcon, FolderArchiveIcon, ImagesIcon, LayoutDashboardIcon, LightbulbIcon, UserIcon } from 'lucide-react'
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
      title: 'Dashboard',
      url: '/dashboard',
      icon: <LayoutDashboardIcon />,
      isActive: pathname === '/dashboard',
    },
    {
      title: 'Accounts',
      url: '/dashboard/accounts',
      icon: <UserIcon />,
      isActive: pathname === '/dashboard/accounts',
    },
    {
      title: 'Posts',
      url: '/dashboard/posts',
      icon: <FileTextIcon />,
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
          title: 'Scheduled posts',
          url: '/dashboard/posts/scheduled',
        },
        {
          title: 'Drafts',
          url: '/dashboard/posts/categories',
        },
      ],

      isActive: pathname === '/dashboard/posts',
    },
  ]
  const studioItems = [
    {
      title: 'Slideshow Generator',
      url: '/dashboard/studio/slideshows',
      icon: <ImagesIcon />,
      isActive: pathname === '/dashboard/studio/slideshows' || pathname.startsWith('/dashboard/studio/slideshows/'),
    },
  ]
  const databaseItems = [
    {
      title: 'Inspirations',
      url: '/dashboard/inspirations',
      icon: <LightbulbIcon />,
    },
    {
      title: 'Files',
      url: '/dashboard/files',
      icon: <FolderArchiveIcon />,
      isActive: pathname === '/dashboard/files' || pathname.startsWith('/dashboard/folders'),
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher workspaces={workspaces} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} sectionTitle="Platform" />
        <NavMain items={studioItems} sectionTitle="Studio" />
        <NavMain items={databaseItems} sectionTitle="Database" />
      </SidebarContent>

      <SidebarFooter>
        <SidebarStorageFooter />
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
