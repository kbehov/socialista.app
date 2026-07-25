'use client'

import { SmartPagination } from '@/components/common/smart-pagination'
import { GenerationDetailSheet } from '@/components/generations/generation-detail-sheet'
import { GenerationsTable } from '@/components/tables/generations.table'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Generation, MetaResponse } from '@socialista/types'
import { useState } from 'react'

type GenerationsViewProps = {
  generations: Generation[]
  meta: MetaResponse
}

export function GenerationsView({ generations, meta }: GenerationsViewProps) {
  const [selected, setSelected] = useState<Generation | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleSelect = (generation: Generation) => {
    setSelected(generation)
    setSheetOpen(true)
  }

  const handleOpenChange = (open: boolean) => {
    setSheetOpen(open)
    if (!open) {
      setSelected(null)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
        <ScrollArea className="h-full" scrollFade scrollbarGutter>
          <GenerationsTable generations={generations} onSelect={handleSelect} />
        </ScrollArea>
      </div>

      <SmartPagination meta={meta} className="shrink-0" />

      <GenerationDetailSheet
        generation={selected}
        open={sheetOpen}
        onOpenChange={handleOpenChange}
      />
    </div>
  )
}
