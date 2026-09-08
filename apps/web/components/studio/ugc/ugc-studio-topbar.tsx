'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/workspace.store'
import { formatCredits } from '@/utils/format'
import {
  AudioLinesIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ImageIcon,
  LayersIcon,
  Loader2Icon,
  PencilIcon,
  SlidersHorizontalIcon,
  VideoIcon,
} from 'lucide-react'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  generating: 'Generating',
  ready: 'Ready',
  failed: 'Failed',
}

const STATUS_DOT: Record<string, string> = {
  draft: 'bg-muted-foreground/45',
  generating: 'bg-amber-500',
  ready: 'bg-emerald-500',
  failed: 'bg-destructive',
}

type UgcStudioTopbarProps = {
  name: string
  status?: string
  aspectRatio?: string
  sceneCount: number
  totalDurationSec: number
  assembling?: boolean
  canAssemble?: boolean
  assembledVideoUrl?: string
  openingProjectEditor?: boolean
  generating?: boolean
  settingsIncomplete?: boolean
  onNameChange: (name: string) => void
  onAssemble: () => void
  onOpenAssembledEditor: () => void
  onOpenSettings?: () => void
  onGenerateAllPhotos?: () => void
  onGenerateAllAudio?: () => void
  onGenerateAllVideos?: () => void
}

export function UgcStudioTopbar({
  name,
  status,
  aspectRatio,
  sceneCount,
  totalDurationSec,
  assembling,
  canAssemble,
  assembledVideoUrl,
  openingProjectEditor,
  generating,
  settingsIncomplete,
  onNameChange,
  onAssemble,
  onOpenAssembledEditor,
  onOpenSettings,
  onGenerateAllPhotos,
  onGenerateAllAudio,
  onGenerateAllVideos,
}: UgcStudioTopbarProps) {
  const credits = useWorkspaceStore(s => s.currentWorkspace?.billing.aiCreditsBalance ?? 0)
  const statusLabel = status ? (STATUS_LABEL[status] ?? status) : undefined
  const statusDot = status ? (STATUS_DOT[status] ?? 'bg-muted-foreground/45') : undefined

  return (
    <header className="flex h-11 min-w-0 shrink-0 items-center gap-2 border-b border-black/[0.06] bg-background/80 px-2 backdrop-blur-xl dark:border-white/[0.08] sm:gap-3 sm:px-3">
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild size="icon-sm" variant="ghost" className="size-7 shrink-0 text-muted-foreground">
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
          className="h-7 max-w-[min(100%,16rem)] border-transparent bg-transparent px-1.5 text-[13px] font-medium tracking-tight shadow-none placeholder:text-muted-foreground focus-visible:border-border focus-visible:bg-background"
        />

        <div className="ml-1 hidden min-w-0 items-center gap-2 text-[12px] text-muted-foreground sm:flex">
          {statusLabel && statusDot ? (
            <span className="inline-flex items-center gap-1.5">
              <span className={cn('size-1.5 rounded-full', statusDot)} />
              {statusLabel}
            </span>
          ) : null}
          <span className="text-border">·</span>
          <span className="tabular-nums">{aspectRatio ?? '9:16'}</span>
          <span className="text-border">·</span>
          <span className="tabular-nums">
            {sceneCount} {sceneCount === 1 ? 'scene' : 'scenes'}
          </span>
          <span className="text-border">·</span>
          <span className="tabular-nums">{totalDurationSec}s</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span className="mr-1 hidden text-[12px] tabular-nums text-muted-foreground md:inline">
          {formatCredits(credits)} credits
        </span>

        {onOpenSettings ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="relative size-7 lg:hidden"
                aria-label="Campaign settings"
                onClick={onOpenSettings}
              >
                <SlidersHorizontalIcon className="size-3.5" />
                {settingsIncomplete ? (
                  <span className="absolute top-1 right-1 size-1.5 rounded-full bg-amber-500" />
                ) : null}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Campaign</TooltipContent>
          </Tooltip>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-2 text-[12px] text-muted-foreground"
              disabled={generating}
            >
              Generate
              <ChevronDownIcon className="size-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuItem disabled={!onGenerateAllPhotos} onClick={onGenerateAllPhotos}>
              <ImageIcon className="size-3.5" />
              All photos
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!onGenerateAllAudio} onClick={onGenerateAllAudio}>
              <AudioLinesIcon className="size-3.5" />
              All audio
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!onGenerateAllVideos} onClick={onGenerateAllVideos}>
              <VideoIcon className="size-3.5" />
              All videos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {assembledVideoUrl ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[12px]"
            disabled={openingProjectEditor}
            onClick={onOpenAssembledEditor}
          >
            {openingProjectEditor ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <PencilIcon className="size-3.5" />
            )}
            Edit
          </Button>
        ) : null}

        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                type="button"
                size="sm"
                className="h-7 px-2.5 text-[12px]"
                disabled={!canAssemble || assembling}
                onClick={onAssemble}
              >
                {assembling ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : (
                  <LayersIcon className="size-3.5" />
                )}
                Assemble
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {canAssemble ? 'Stitch ready scenes into one ad' : 'Render at least one scene first'}
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
