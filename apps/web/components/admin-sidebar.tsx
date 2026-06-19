import { LayoutDashboardIcon, PictureInPictureIcon } from 'lucide-react'
import Link from 'next/link'

import { NavMain } from './nav-main'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from './ui/sidebar'

const items = [
  {
    title: 'Dashboard',
    url: '/manager',
    icon: <LayoutDashboardIcon />,
  },
  {
    title: 'Inspirations',
    url: '/manager/inspirations',
    icon: <PictureInPictureIcon />,
    isActive: true,
    items: [
      {
        title: 'All inspirations',
        url: '/manager/inspirations',
      },
      {
        title: 'Create',
        url: '/manager/inspirations/create',
      },
    ],
  },
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/manager">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <LayoutDashboardIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Socialista</span>
                  <span className="truncate text-xs text-muted-foreground">Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
