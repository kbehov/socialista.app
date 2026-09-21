import { dashboardSurface } from '@/components/dashboard'
import { MANAGER_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import {
  BoxIcon,
  FolderIcon,
  ImageIcon,
  LayoutTemplateIcon,
  LightbulbIcon,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'

type DirectoryItem = {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

const items: DirectoryItem[] = [
  {
    title: 'Inspirations',
    description: 'Import TikTok posts and organize them by category and niche.',
    href: MANAGER_ROUTES.INSPIRATIONS,
    icon: LightbulbIcon,
  },
  {
    title: 'Templates',
    description: 'Image and video templates used in the studio galleries.',
    href: MANAGER_ROUTES.TEMPLATES,
    icon: LayoutTemplateIcon,
  },
  {
    title: 'Static ads',
    description: 'Templates for the static ads studio gallery.',
    href: MANAGER_ROUTES.STATIC_AD_TEMPLATES,
    icon: ImageIcon,
  },
  {
    title: 'Files',
    description: 'Browse folders and uploaded assets for the workspace.',
    href: MANAGER_ROUTES.FILES,
    icon: FolderIcon,
  },
  {
    title: 'Models',
    description: 'AI models, pricing, and the companies they belong to.',
    href: MANAGER_ROUTES.MODELS,
    icon: BoxIcon,
  },
]

export function ManagerDirectory() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            dashboardSurface.section,
            'flex items-start gap-3 p-4 no-underline outline-none transition-colors duration-150',
            'hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.98] motion-reduce:active:scale-100',
          )}
        >
          <span className={cn(dashboardSurface.emptyIcon, 'flex items-center justify-center text-muted-foreground')}>
            <item.icon strokeWidth={1.5} />
          </span>
          <span className="min-w-0 pt-0.5">
            <span className="block text-sm font-medium tracking-tight text-foreground">{item.title}</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{item.description}</span>
          </span>
        </Link>
      ))}
    </div>
  )
}
