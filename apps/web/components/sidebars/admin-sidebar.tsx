import { BoxIcon, FolderArchive, LayoutDashboardIcon, LightbulbIcon } from 'lucide-react'
import Link from 'next/link'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '../ui/sidebar'
import { NavMain } from './nav-main'

const items = [
  {
    title: 'Dashboard',
    url: '/manager',
    icon: <LayoutDashboardIcon />,
  },
  {
    title: 'Inspirations',
    url: '/manager/inspirations',
    icon: <LightbulbIcon />,
    isActive: true,
    items: [
      {
        title: 'All inspirations',
        url: '/manager/inspirations',
      },
      {
        title: 'Categories',
        url: '/manager/inspirations/categories',
      },
      {
        title: 'Niches',
        url: '/manager/inspirations/niches',
      },
    ],
  },
  {
    title: 'Files',
    url: '/manager/files',
    icon: <FolderArchive />,
  },
  {
    title: 'Models',
    url: '/manager/models',
    icon: <BoxIcon />,
  },
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border h-16 flex items-center justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="default" asChild>
              <Link href="/manager">
                <div className="flex aspect-square size-6 sm:size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-md lg:text-2xl">✺</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-md ">Socialista.app</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={items} sectionTitle="Main" />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
