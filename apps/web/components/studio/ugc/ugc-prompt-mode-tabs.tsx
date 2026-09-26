'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { UgcWorkbenchTab } from '@/types/ugc.types'
import { AudioLinesIcon, ImageIcon, VideoIcon } from 'lucide-react'

const MODES = [
  {
    id: 'image' as const,
    label: 'Image',
    icon: ImageIcon,
    hint: 'Create the photo this scene starts from.',
  },
  {
    id: 'audio' as const,
    label: 'Audio',
    icon: AudioLinesIcon,
    lipSyncHint: 'Write the line they say on camera, then generate the voiceover.',
    voiceoverHint: 'Write an optional line to mix over the clip.',
  },
  {
    id: 'video' as const,
    label: 'Video',
    icon: VideoIcon,
    hint: 'Animate the photo into the final clip.',
  },
]

const ALL_TABS: UgcWorkbenchTab[] = MODES.map(mode => mode.id)

function modeHint(mode: (typeof MODES)[number], voiceoverOnly: boolean): string {
  if (mode.id === 'audio') {
    return voiceoverOnly ? mode.voiceoverHint : mode.lipSyncHint
  }
  return mode.hint
}

type UgcPromptModeTabsProps = {
  value: UgcWorkbenchTab
  onChange: (tab: UgcWorkbenchTab) => void
  tabs?: UgcWorkbenchTab[]
  voiceoverOnly?: boolean
}

export function UgcPromptModeTabs({
  value,
  onChange,
  tabs = ALL_TABS,
  voiceoverOnly = false,
}: UgcPromptModeTabsProps) {
  const modes = MODES.filter(mode => tabs.includes(mode.id))

  return (
    <div
      role="tablist"
      aria-label="Scene generation mode"
      className="flex w-full rounded-[10px] bg-black/[0.04] p-0.5 dark:bg-white/[0.06]"
    >
      {modes.map(mode => {
        const Icon = mode.icon
        const active = value === mode.id
        return (
          <div key={mode.id} className="min-w-0 flex-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onChange(mode.id)}
                  className={cn(
                    'inline-flex h-7 w-full min-w-0 items-center justify-center gap-1.5 rounded-[8px] px-2',
                    'text-[12px] font-medium tracking-[-0.015em] transition-[color,background-color,box-shadow] duration-150',
                    active
                      ? 'bg-background text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.05] dark:bg-[var(--surface-1)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.28)] dark:ring-white/[0.08]'
                      : 'text-muted-foreground hover:text-foreground/85',
                  )}
                >
                  <Icon className="size-3.5 shrink-0 opacity-80" strokeWidth={1.75} />
                  <span className="truncate">{mode.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">{modeHint(mode, voiceoverOnly)}</TooltipContent>
            </Tooltip>
          </div>
        )
      })}
    </div>
  )
}
