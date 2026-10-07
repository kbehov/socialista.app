'use client'

import { useImageStudio } from '@/components/studio/images/image-studio-provider'
import {
  IMAGE_IDEA_STARTERS,
  pickImageIdeaStarters,
  type ImageIdeaStarter,
} from '@/lib/studio/image-idea-starters'
import { cn } from '@/lib/utils'
import { useSyncExternalStore } from 'react'

const VISIBLE_COUNT = 5
const SERVER_STARTERS = IMAGE_IDEA_STARTERS.slice(0, VISIBLE_COUNT)

let visitStarters: readonly ImageIdeaStarter[] | null = null

function subscribe() {
  return () => {}
}

function getVisitStarters() {
  visitStarters ??= pickImageIdeaStarters(VISIBLE_COUNT)
  return visitStarters
}

type ImageIdeaChipsProps = {
  compact?: boolean
}

function IdeaChip({
  starter,
  compact,
  onSelect,
}: {
  starter: ImageIdeaStarter
  compact?: boolean
  onSelect: (prompt: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(starter.prompt)}
      className={cn(
        'inline-flex shrink-0 items-center rounded-full font-medium leading-none tracking-[-0.015em]',
        'transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        'active:scale-[0.96] motion-reduce:active:scale-100',
        compact
          ? cn(
              'h-7 px-3 text-[12px] font-normal text-muted-foreground/80',
              'bg-transparent ring-1 ring-inset ring-black/[0.06]',
              'hover:bg-black/[0.03] hover:text-foreground hover:ring-black/[0.1]',
              'dark:ring-white/[0.08] dark:hover:bg-white/[0.04] dark:hover:ring-white/[0.12]',
            )
          : cn(
              'h-8 px-3 text-[12px] text-black/64',
              'bg-transparent ring-1 ring-inset ring-black/10',
              'hover:bg-black/[0.04] hover:text-foreground',
              'dark:text-white/64 dark:ring-white/12 dark:hover:bg-white/[0.06]',
            ),
      )}
    >
      {starter.label}
    </button>
  )
}

export function ImageIdeaChips({ compact = false }: ImageIdeaChipsProps) {
  const { setPrompt } = useImageStudio()
  const starters = useSyncExternalStore(subscribe, getVisitStarters, () => SERVER_STARTERS)

  return (
    <div
      className="w-full min-w-0"
      aria-label={compact ? 'Prompt starters' : undefined}
    >
      <div
        className={cn(
          'flex flex-wrap items-center justify-center gap-1.5',
          compact ? 'min-h-7 px-1' : 'min-h-8',
        )}
      >
        {starters.map(starter => (
          <IdeaChip
            key={starter.id}
            starter={starter}
            compact={compact}
            onSelect={setPrompt}
          />
        ))}
      </div>
    </div>
  )
}
