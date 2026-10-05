'use client'

import { StudioTemplatePreviewMedia } from '@/components/studio/templates/studio-template-preview-media'
import {
  IMAGE_TEMPLATE_RECENTS_KEY,
  readImageTemplateRecents,
  recentRecordToTemplate,
  type ImageTemplateRecentRecord,
} from '@/lib/studio/image-template-recents'
import { cn } from '@/lib/utils'
import type { StudioTemplateDto } from '@socialista/types'
import { useSyncExternalStore } from 'react'

const EMPTY_RECENTS: ImageTemplateRecentRecord[] = []

let cachedRaw: string | null = null
let cachedRecords: ImageTemplateRecentRecord[] = EMPTY_RECENTS

function subscribe(onStoreChange: () => void) {
  window.addEventListener('studio-image-recents', onStoreChange)
  window.addEventListener('storage', onStoreChange)
  return () => {
    window.removeEventListener('studio-image-recents', onStoreChange)
    window.removeEventListener('storage', onStoreChange)
  }
}

function getRecentsSnapshot() {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(IMAGE_TEMPLATE_RECENTS_KEY)
  } catch {
    raw = null
  }
  if (raw === cachedRaw) return cachedRecords
  cachedRaw = raw
  cachedRecords = readImageTemplateRecents()
  return cachedRecords
}

type ImageTemplateRecentsProps = {
  onOpen: (template: StudioTemplateDto, templates: StudioTemplateDto[]) => void
}

export function ImageTemplateRecents({ onOpen }: ImageTemplateRecentsProps) {
  const records = useSyncExternalStore(subscribe, getRecentsSnapshot, () => EMPTY_RECENTS)

  if (records.length === 0) return null

  const templates = records.map(recentRecordToTemplate)

  return (
    <div className="mb-6">
      <p className="mb-3 text-[13px] font-medium leading-none tracking-[-0.011em] text-black/56 dark:text-white/56">
        Jump back in
      </p>
      <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {records.map((record, index) => {
          const template = templates[index]
          if (!template) return null
          const label = record.name ?? 'Recent template'

          return (
            <button
              key={record.id}
              type="button"
              aria-label={`Recreate ${label}`}
              onClick={() => onOpen(template, templates)}
              className={cn(
                'w-[4.75rem] shrink-0 snap-start text-left sm:w-[5.25rem]',
                'transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                'active:scale-[0.96] motion-reduce:active:scale-100',
              )}
            >
              <StudioTemplatePreviewMedia
                url={record.previewImageUrl}
                alt=""
                className="aspect-[4/5] w-full rounded-xl bg-black/[0.04] outline outline-1 -outline-offset-1 outline-black/10 dark:bg-white/[0.04] dark:outline-white/10"
              />
              <span className="mt-1.5 block truncate px-0.5 text-[11px] font-medium tracking-[-0.015em] text-foreground/80">
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
