'use client'

import { UgcModelChips } from '@/components/studio/ugc/ugc-model-chips'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useWorkspaceStore } from '@/store/workspace.store'
import { ChevronLeftIcon, SlidersHorizontalIcon } from 'lucide-react'
import Link from 'next/link'

type UgcStudioTopbarProps = {
  name: string
  generating?: boolean
  imageValue?: string
  scriptValue?: string
  videoValue?: string
  onNameChange: (name: string) => void
  onModelChange: (key: 'image' | 'script' | 'video', value: string) => void
}

export function UgcStudioTopbar({
  name,
  generating,
  imageValue,
  scriptValue,
  videoValue,
  onNameChange,
  onModelChange,
}: UgcStudioTopbarProps) {
  const credits = useWorkspaceStore(s => s.currentWorkspace?.billing.aiCreditsBalance ?? 0)

  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2 border-b border-border/40 bg-background/80 px-2 py-1.5 backdrop-blur-xl sm:gap-3 sm:px-3">
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild size="icon-sm" variant="ghost" className="size-7 shrink-0">
              <Link href={DASHBOARD_ROUTES.STUDIO.UGC} aria-label="Back to UGC ads">
                <ChevronLeftIcon className="size-3.5" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>All UGC ads</TooltipContent>
        </Tooltip>

        <Input
          value={name}
          onChange={event => onNameChange(event.target.value)}
          aria-label="Project name"
          className="h-7 max-w-[240px] border-transparent bg-transparent px-2 text-xs font-medium shadow-none focus-visible:border-input focus-visible:bg-background"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <span className="hidden text-[11px] tabular-nums text-muted-foreground sm:inline">
          {credits} credits
        </span>

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" size="sm" variant="outline" className="h-7 gap-1.5 px-2.5 text-[11px]">
              <SlidersHorizontalIcon className="size-3.5" />
              <span className="hidden sm:inline">Models</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-3">
            <p className="mb-2.5 text-[11px] leading-relaxed text-muted-foreground">
              Image builds scenes, script writes dialogue, video animates the clip.
            </p>
            <UgcModelChips
              imageValue={imageValue}
              scriptValue={scriptValue}
              videoValue={videoValue}
              scriptEnabled
              disabled={generating}
              onChange={onModelChange}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
