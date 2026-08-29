'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useWorkspaceStore } from '@/store/workspace.store'
import { formatCredits } from '@/utils/format'
import { ChevronLeftIcon, LayersIcon, Loader2Icon, PencilIcon } from 'lucide-react'
import Link from 'next/link'

type UgcStudioTopbarProps = {
  name: string
  assembling?: boolean
  canAssemble?: boolean
  assembledVideoUrl?: string
  openingProjectEditor?: boolean
  onNameChange: (name: string) => void
  onAssemble: () => void
  onOpenAssembledEditor: () => void
}

export function UgcStudioTopbar({
  name,
  assembling,
  canAssemble,
  assembledVideoUrl,
  openingProjectEditor,
  onNameChange,
  onAssemble,
  onOpenAssembledEditor,
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
          {formatCredits(credits)} credits
        </span>
        {assembledVideoUrl ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-[11px]"
            disabled={openingProjectEditor}
            onClick={onOpenAssembledEditor}
          >
            {openingProjectEditor ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <PencilIcon className="size-3.5" />
            )}
            Edit ad
          </Button>
        ) : null}
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                type="button"
                size="sm"
                className="h-7 px-2.5 text-[11px]"
                disabled={!canAssemble || assembling}
                onClick={onAssemble}
              >
                {assembling ? <Loader2Icon className="size-3.5 animate-spin" /> : <LayersIcon className="size-3.5" />}
                Assemble
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {canAssemble ? 'Stitch ready clips into one ad' : 'Generate at least two clip videos first'}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
