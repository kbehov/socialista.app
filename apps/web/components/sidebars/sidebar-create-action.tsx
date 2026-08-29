'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { ImagesIcon, LayersIcon, SquarePenIcon, UserRoundIcon, VideoIcon } from 'lucide-react'
import Link from 'next/link'

const createOptions = [
  {
    title: 'Image',
    url: DASHBOARD_ROUTES.STUDIO.IMAGES,
    icon: ImagesIcon,
  },
  {
    title: 'Slideshow',
    url: DASHBOARD_ROUTES.STUDIO.SLIDESHOW_CREATE,
    icon: LayersIcon,
  },
  {
    title: 'Video',
    url: DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE,
    icon: VideoIcon,
  },
  {
    title: 'Influencer',
    url: DASHBOARD_ROUTES.STUDIO.INFLUENCER_CREATE,
    icon: UserRoundIcon,
  },
] as const

function CreateMenuItems() {
  return createOptions.map(option => (
    <DropdownMenuItem key={option.url} asChild>
      <Link href={option.url}>
        <option.icon className="size-3.5" strokeWidth={1.5} />
        {option.title}
      </Link>
    </DropdownMenuItem>
  ))
}

export function SidebarCreateAction({ compact = false }: { compact?: boolean }) {
  if (!compact) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="sidebar-header-icon group-data-[collapsible=icon]:hidden" aria-label="Create">
          <SquarePenIcon />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="w-44">
        <CreateMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
