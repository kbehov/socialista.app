'use client'

import { useStartUgcStudioTour } from '@/components/studio/ugc/ugc-studio-tour'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import {
  ChevronLeftIcon,
  ClapperboardIcon,
  HelpCircleIcon,
  Loader2Icon,
  SlidersHorizontalIcon,
} from 'lucide-react'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  generating: 'Generating',
  ready: 'Ready',
  failed: 'Failed',
}

const STATUS_TONE: Record<string, string> = {
  draft: 'text-muted-foreground',
  generating: 'text-amber-700 dark:text-amber-400',
  ready: 'text-emerald-700 dark:text-emerald-400',
  failed: 'text-destructive',
}

const STATUS_DOT: Record<string, string> = {
  draft: 'bg-muted-foreground/50',
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
  finishing?: boolean
  canFinish?: boolean
  editorPrepared?: boolean
  settingsIncomplete?: boolean
  onNameChange: (name: string) => void
  onFinish: () => void
  onOpenSettings?: () => void
}

function TopbarMeta({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md bg-muted/50 px-1.5 py-0.5 text-[11px] leading-none tabular-nums text-muted-foreground ring-1 ring-black/[0.04] dark:ring-white/[0.06]',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function UgcStudioTopbar({
  name,
  status,
  aspectRatio,
  sceneCount,
  totalDurationSec,
  finishing,
  canFinish,
  editorPrepared,
  settingsIncomplete,
  onNameChange,
  onFinish,
  onOpenSettings,
}: UgcStudioTopbarProps) {
  const statusLabel = status ? (STATUS_LABEL[status] ?? status) : undefined
  const statusDot = status ? (STATUS_DOT[status] ?? STATUS_DOT.draft) : undefined
  const statusTone = status ? (STATUS_TONE[status] ?? STATUS_TONE.draft) : undefined
  const startTour = useStartUgcStudioTour()

  return (
    <header
      id="ugc-tour-topbar"
      className="flex h-10 min-w-0 shrink-0 items-center gap-2 border-b border-black/[0.06] bg-background/90 px-2 backdrop-blur-xl dark:border-white/[0.08] sm:gap-2.5 sm:px-3"
    >
      <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              size="icon-xs"
              variant="ghost"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <Link href={DASHBOARD_ROUTES.STUDIO.UGC} aria-label="Back to UGC ads">
                <ChevronLeftIcon className="size-3.5" strokeWidth={1.75} />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">All UGC ads</TooltipContent>
        </Tooltip>

        <Input
          value={name}
          onChange={event => onNameChange(event.target.value)}
          aria-label="Project name"
          className="h-7 max-w-[min(100%,15rem)] min-w-[6rem] border-transparent bg-transparent px-1.5 text-[13px] font-medium tracking-[-0.01em] shadow-none placeholder:text-muted-foreground focus-visible:border-border/80 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/25 sm:max-w-[min(100%,18rem)]"
        />

        <div className="ml-0.5 hidden min-w-0 items-center gap-1 sm:flex">
          {statusLabel && statusDot && statusTone ? (
            <TopbarMeta className={cn('gap-1.5 font-medium', statusTone)}>
              <span className={cn('size-1.5 rounded-full', statusDot)} aria-hidden />
              {statusLabel}
            </TopbarMeta>
          ) : null}
          <TopbarMeta>{aspectRatio ?? '9:16'}</TopbarMeta>
          <TopbarMeta>
            {sceneCount} {sceneCount === 1 ? 'scene' : 'scenes'}
          </TopbarMeta>
          <TopbarMeta>{totalDurationSec}s</TopbarMeta>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Studio tour"
              onClick={startTour}
            >
              <HelpCircleIcon className="size-3.5" strokeWidth={1.75} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">How this studio works</TooltipContent>
        </Tooltip>

        {onOpenSettings ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                className="relative text-muted-foreground hover:text-foreground lg:hidden"
                aria-label="Campaign settings"
                onClick={onOpenSettings}
              >
                <SlidersHorizontalIcon className="size-3.5" strokeWidth={1.75} />
                {settingsIncomplete ? (
                  <span className="absolute top-1 right-1 size-1.5 rounded-full bg-amber-500 ring-2 ring-background" />
                ) : null}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Campaign settings</TooltipContent>
          </Tooltip>
        ) : null}

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button
                id="ugc-tour-finish"
                type="button"
                size="sm"
                className="h-7 gap-1.5 px-2.5 text-[12px] font-medium tracking-[-0.01em]"
                disabled={!canFinish || finishing}
                onClick={onFinish}
              >
                {finishing ? (
                  <Loader2Icon className="size-3.5 animate-spin" strokeWidth={1.75} />
                ) : (
                  <ClapperboardIcon className="size-3.5" strokeWidth={1.75} />
                )}
                {editorPrepared ? 'Edit video' : 'Finish video'}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {canFinish
              ? editorPrepared
                ? 'Open the video editor for final touches'
                : 'Open all scenes in the video editor for final touches'
              : 'Generate a video for every scene first'}
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
