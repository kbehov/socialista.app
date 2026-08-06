'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { ImagesIcon, LayersIcon, PenLineIcon, UserRoundIcon, VideoIcon } from 'lucide-react'
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
        <option.icon className="size-4" strokeWidth={1.75} />
        {option.title}
      </Link>
    </DropdownMenuItem>
  ))
}

export function SidebarCreateAction() {
  return (
    <>
      <div className="px-2 pb-1 pt-0.5 group-data-[collapsible=icon]:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="sidebar-create-cta">
              <PenLineIcon className="size-3.5" strokeWidth={1.75} />
              Create
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" sideOffset={8} className="w-44">
            <CreateMenuItems />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SidebarMenu className="hidden px-1 pb-1 group-data-[collapsible=icon]:flex">
        <SidebarMenuItem>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="sm" className="text-primary hover:text-primary">
                    <PenLineIcon className="size-4" strokeWidth={1.75} />
                    <span className="sr-only">Create</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" align="center" className="text-xs">
                Create
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start" side="right" sideOffset={8} className="w-44">
              <CreateMenuItems />
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  )
}
