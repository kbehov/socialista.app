'use client'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavMainItem = {
  title: string
  url: string
  icon?: React.ReactNode
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

function isItemActive(pathname: string, item: NavMainItem) {
  if (item.isActive !== undefined) return item.isActive
  return pathname === item.url
}

export function NavMain({ items }: { items: NavMainItem[] }) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item =>
          item.items?.length ? (
            <Collapsible key={item.title} asChild defaultOpen={isItemActive(pathname, item)} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      'font-medium',
                      isItemActive(pathname, item)
                        ? 'bg-sidebar-accent rounded-md text-foreground font-medium'
                        : 'text-muted-foreground font-normal',
                    )}
                  >
                    {item.icon}
                    <span className="text-sm">{item.title}</span>
                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map(subItem => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={cn(pathname === subItem.url ? 'text-foreground' : 'text-muted-foreground')}
                        >
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem
              key={item.title}
              className={
                isItemActive(pathname, item) ? 'bg-sidebar-accent rounded-md text-foreground' : 'text-muted-foreground'
              }
            >
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url} className="text-sm">
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
