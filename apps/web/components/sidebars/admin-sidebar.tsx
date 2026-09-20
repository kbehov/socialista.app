'use client'

import { NavMain } from '@/components/sidebars/nav-main'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  DASHBOARD_ROUTES,
  isManagerCompaniesPath,
  isManagerFilesPath,
  isManagerInspirationCategoriesPath,
  isManagerInspirationNichesPath,
  isManagerInspirationsPath,
  isManagerModelsPath,
  isManagerRootPath,
  isManagerStaticAdTemplateCategoriesPath,
  isManagerStaticAdTemplatesPath,
  isManagerTemplateCategoriesPath,
  isManagerTemplatesPath,
  MANAGER_ROUTES,
} from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import {
  AppWindowIcon,
  BoxIcon,
  Building2Icon,
  FolderIcon,
  FolderTreeIcon,
  LayoutDashboardIcon,
  ImageIcon,
  LayoutTemplateIcon,
  LightbulbIcon,
  ShapesIcon,
  TagsIcon,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

type AdminSidebarProps = React.ComponentProps<typeof Sidebar>

type SidebarNavItem = {
  title: string
  url: string
  icon: React.ReactNode
  isActive: boolean
}

const iconClassName = 'nav-icon size-4 shrink-0'

function navIcon(Icon: LucideIcon) {
  return <Icon className={iconClassName} strokeWidth={1.5} />
}

function buildOverviewItems(pathname: string): SidebarNavItem[] {
  return [
    {
      title: 'Overview',
      url: MANAGER_ROUTES.ROOT,
      icon: navIcon(LayoutDashboardIcon),
      isActive: isManagerRootPath(pathname),
    },
  ]
}

function buildCatalogItems(pathname: string): SidebarNavItem[] {
  return [
    {
      title: 'Inspirations',
      url: MANAGER_ROUTES.INSPIRATIONS,
      icon: navIcon(LightbulbIcon),
      isActive: isManagerInspirationsPath(pathname),
    },
    {
      title: 'Categories',
      url: MANAGER_ROUTES.INSPIRATION_CATEGORIES,
      icon: navIcon(TagsIcon),
      isActive: isManagerInspirationCategoriesPath(pathname),
    },
    {
      title: 'Niches',
      url: MANAGER_ROUTES.INSPIRATION_NICHES,
      icon: navIcon(ShapesIcon),
      isActive: isManagerInspirationNichesPath(pathname),
    },
  ]
}

function buildLibraryItems(pathname: string): SidebarNavItem[] {
  return [
    {
      title: 'Templates',
      url: MANAGER_ROUTES.TEMPLATES,
      icon: navIcon(LayoutTemplateIcon),
      isActive: isManagerTemplatesPath(pathname),
    },
    {
      title: 'Categories',
      url: MANAGER_ROUTES.TEMPLATE_CATEGORIES,
      icon: navIcon(FolderTreeIcon),
      isActive: isManagerTemplateCategoriesPath(pathname),
    },
    {
      title: 'Files',
      url: MANAGER_ROUTES.FILES,
      icon: navIcon(FolderIcon),
      isActive: isManagerFilesPath(pathname),
    },
  ]
}

function buildStaticAdsItems(pathname: string): SidebarNavItem[] {
  return [
    {
      title: 'Templates',
      url: MANAGER_ROUTES.STATIC_AD_TEMPLATES,
      icon: navIcon(ImageIcon),
      isActive: isManagerStaticAdTemplatesPath(pathname),
    },
    {
      title: 'Categories',
      url: MANAGER_ROUTES.STATIC_AD_TEMPLATE_CATEGORIES,
      icon: navIcon(FolderTreeIcon),
      isActive: isManagerStaticAdTemplateCategoriesPath(pathname),
    },
  ]
}

function buildAiItems(pathname: string): SidebarNavItem[] {
  return [
    {
      title: 'Models',
      url: MANAGER_ROUTES.MODELS,
      icon: navIcon(BoxIcon),
      isActive: isManagerModelsPath(pathname),
    },
    {
      title: 'Companies',
      url: MANAGER_ROUTES.COMPANIES,
      icon: navIcon(Building2Icon),
      isActive: isManagerCompaniesPath(pathname),
    },
  ]
}

export function AdminSidebar({ className, ...props }: AdminSidebarProps) {
  const pathname = usePathname()

  const overviewItems = useMemo(() => buildOverviewItems(pathname), [pathname])
  const catalogItems = useMemo(() => buildCatalogItems(pathname), [pathname])
  const libraryItems = useMemo(() => buildLibraryItems(pathname), [pathname])
  const staticAdsItems = useMemo(() => buildStaticAdsItems(pathname), [pathname])
  const aiItems = useMemo(() => buildAiItems(pathname), [pathname])

  return (
    <Sidebar collapsible="icon" className={cn(className)} {...props}>
      <SidebarHeader className="flex h-(--dashboard-chrome-height) shrink-0 flex-row items-center gap-0.5 border-b border-sidebar-border px-2 py-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1">
        <div className="min-w-0 flex-1 group-data-[collapsible=icon]:flex-none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Manager"
                className="h-7 gap-1.5 px-1.5 group-data-[collapsible=icon]:justify-center"
              >
                <Link href={MANAGER_ROUTES.ROOT}>
                  <div className="sidebar-switcher-avatar">M</div>
                  <span className="min-w-0 flex-1 truncate font-medium tracking-tight group-data-[collapsible=icon]:hidden">
                    Manager
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarHeader>

      <SidebarContent className="sidebar-scrollbar gap-3 overflow-x-hidden px-2 pt-2.5 pb-1 group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-2">
        <NavMain items={overviewItems} collapsible={false} />
        <NavMain items={catalogItems} sectionTitle="Catalog" />
        <NavMain items={libraryItems} sectionTitle="Library" />
        <NavMain items={staticAdsItems} sectionTitle="Static ads" />
        <NavMain items={aiItems} sectionTitle="AI" />
      </SidebarContent>

      <SidebarFooter className="shrink-0 gap-1 px-2 pb-2 pt-1 group-data-[collapsible=icon]:px-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Open app"
              className="h-7 gap-1.5 px-1.5 group-data-[collapsible=icon]:justify-center"
            >
              <Link href={DASHBOARD_ROUTES.ROOT}>
                <AppWindowIcon className="nav-icon size-4 shrink-0" strokeWidth={1.5} />
                <span className="min-w-0 flex-1 truncate font-medium tracking-tight group-data-[collapsible=icon]:hidden">
                  Open app
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
