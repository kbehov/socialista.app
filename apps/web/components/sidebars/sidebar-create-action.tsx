'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { ImagesIcon, LayersIcon, PenLineIcon, VideoIcon } from 'lucide-react'
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
] as const

export function SidebarCreateAction() {
  return (
    <div className="px-2 pt-2 pb-1 group-data-[collapsible=icon]:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="sidebar-create-cta">
            <PenLineIcon className="size-3.5" strokeWidth={1.75} />
            Create
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" sideOffset={8} className="w-44">
          {createOptions.map(option => (
            <DropdownMenuItem key={option.url} asChild>
              <Link href={option.url}>
                <option.icon className="size-4" strokeWidth={1.75} />
                {option.title}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
