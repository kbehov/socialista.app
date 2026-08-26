'use client'

import { AddBrandTrigger } from '@/components/brands/add-brand-trigger'
import { AddProductTrigger } from '@/components/products/add-product-trigger'
import {
  DASHBOARD_ROUTES,
  isDashboardBrandsPath,
  isDashboardProductsPath,
  isDashboardSkillsPath,
} from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { PackageIcon, PaletteIcon, SparklesIcon, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CreateSkillMenu } from '@/components/skills/create-skill-menu'

type ContextHubHeaderProps = {
  workspaceId: string
}

type HubTab = {
  href: string
  label: string
  icon: LucideIcon
  isActive: (pathname: string) => boolean
}

const hubTabs: HubTab[] = [
  {
    href: DASHBOARD_ROUTES.PRODUCTS,
    label: 'Products',
    icon: PackageIcon,
    isActive: isDashboardProductsPath,
  },
  {
    href: DASHBOARD_ROUTES.SKILLS,
    label: 'Skills',
    icon: SparklesIcon,
    isActive: isDashboardSkillsPath,
  },
  {
    href: DASHBOARD_ROUTES.BRANDS,
    label: 'Brands',
    icon: PaletteIcon,
    isActive: isDashboardBrandsPath,
  },
]

const pageMeta = {
  products: {
    title: 'Products',
    description: 'Product catalog for ads, slideshows, and studio workflows in this workspace.',
  },
  skills: {
    title: 'Skills',
    description: 'Every skill across workspace, brand, and products.',
  },
  brands: {
    title: 'Brands',
    description: 'Identity, colors, and positioning used as context for posts and AI tools.',
  },
} as const

export function ContextHubHeader({ workspaceId }: ContextHubHeaderProps) {
  const pathname = usePathname()
  const onProducts = isDashboardProductsPath(pathname)
  const onSkills = isDashboardSkillsPath(pathname)
  const onBrands = isDashboardBrandsPath(pathname)
  const meta = onSkills ? pageMeta.skills : onProducts ? pageMeta.products : onBrands ? pageMeta.brands : null

  return (
    <header className="sticky top-0 z-20 -mx-(--spacing-dashboard-x) shrink-0 bg-background/95 px-(--spacing-dashboard-x) backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex items-center gap-5 border-b border-border/50 py-2.5">
        <span className="shrink-0 text-[13px] font-semibold tracking-tight text-foreground">Context</span>

        <nav
          aria-label="Context sections"
          className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {hubTabs.map(tab => {
            const active = tab.isActive(pathname)
            const Icon = tab.icon

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-[background-color,color] duration-150',
                  active
                    ? 'bg-muted/80 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {meta ? (
        <div className="flex flex-col gap-4 pt-6 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-[-0.025em] text-foreground sm:text-[1.75rem] sm:leading-tight">
              {meta.title}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">{meta.description}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {onProducts ? <AddProductTrigger workspaceId={workspaceId} /> : null}
            {onSkills ? <CreateSkillMenu /> : null}
            {onBrands ? <AddBrandTrigger workspaceId={workspaceId} /> : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
