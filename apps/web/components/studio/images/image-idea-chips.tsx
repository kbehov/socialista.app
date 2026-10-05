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

function IdeaChip({
  starter,
  onSelect,
}: {
  starter: ImageIdeaStarter
  onSelect: (prompt: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(starter.prompt)}
      className={cn(
        'inline-flex h-8 items-center rounded-full px-3',
        'text-[12px] font-medium tracking-[-0.015em] text-black/64',
        'bg-transparent ring-1 ring-inset ring-black/10',
        'transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
        'hover:bg-black/[0.04] hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        'active:scale-[0.96] motion-reduce:active:scale-100',
        'dark:text-white/64 dark:ring-white/12 dark:hover:bg-white/[0.06]',
      )}
    >
      {starter.label}
    </button>
  )
}

export function ImageIdeaChips() {
  const { setPrompt } = useImageStudio()
  const starters = useSyncExternalStore(subscribe, getVisitStarters, () => SERVER_STARTERS)

  return (
    <div className="flex min-h-8 flex-wrap items-center justify-center gap-1.5">
      {starters.map(starter => (
        <IdeaChip key={starter.id} starter={starter} onSelect={setPrompt} />
      ))}
    </div>
  )
}
