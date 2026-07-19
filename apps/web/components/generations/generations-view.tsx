'use client'

import { GenerationDetailSheet } from '@/components/generations/generation-detail-sheet'
import { GenerationsPagination } from '@/components/generations/generations-pagination'
import { GenerationsTable } from '@/components/tables/generations.table'
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
      <GenerationsTable generations={generations} onSelect={handleSelect} />
      <GenerationsPagination meta={meta} />
      <GenerationDetailSheet
        generation={selected}
        open={sheetOpen}
        onOpenChange={handleOpenChange}
      />
    </div>
  )
}
