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
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'
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
  return pathname === item.url || pathname.startsWith(`${item.url}/`)
}

function isSubItemActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`)
}

function NavItems({ items }: { items: NavMainItem[] }) {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {items.map(item =>
        item.items?.length ? (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={isItemActive(pathname, item)}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title} isActive={isItemActive(pathname, item)}>
                  {item.icon}
                  <span>{item.title}</span>
                  <ChevronRightIcon
                    className="ml-auto size-3! text-muted-foreground transition-transform duration-150 group-data-[state=open]/collapsible:rotate-90"
                    strokeWidth={2}
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items.map(subItem => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild isActive={isSubItemActive(pathname, subItem.url)}>
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
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild tooltip={item.title} isActive={isItemActive(pathname, item)}>
              <Link href={item.url}>
                {item.icon}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ),
      )}
    </SidebarMenu>
  )
}

export function NavMain({
  items,
  sectionTitle,
  collapsible = true,
  className,
}: {
  items: NavMainItem[]
  sectionTitle?: string
  collapsible?: boolean
  className?: string
}) {
  const { state } = useSidebar()
  const iconCollapsed = state === 'collapsed'

  if (!sectionTitle || iconCollapsed || !collapsible) {
    return (
      <SidebarGroup className={cn('px-0 py-0', className)}>
        {sectionTitle && !iconCollapsed ? (
          <SidebarGroupLabel className="mb-0.5 px-2">{sectionTitle}</SidebarGroupLabel>
        ) : null}
        <NavItems items={items} />
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup className={cn('px-0 py-0', className)}>
      <Collapsible defaultOpen className="group/nav-section">
        <CollapsibleTrigger className="sidebar-section-trigger">
          <ChevronDownIcon className="sidebar-section-chevron group-data-[state=closed]/nav-section:-rotate-90" />
          {sectionTitle}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <NavItems items={items} />
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  )
}
