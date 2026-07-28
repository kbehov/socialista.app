'use client'

import { SmartPagination } from '@/components/common/smart-pagination'
import { DashboardTableShell } from '@/components/dashboard/dashboard-table-shell'
import { GenerationDetailSheet } from '@/components/generations/generation-detail-sheet'
import { useReportPageScroll } from '@/components/headers/page-scroll-compact'
import { GenerationsTable } from '@/components/tables/generations.table'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Generation, MetaResponse } from '@socialista/types'
import { useState } from 'react'

type GenerationsViewProps = {
  generations: Generation[]
  meta: MetaResponse
}

export function GenerationsView({ generations, meta }: GenerationsViewProps) {
  const reportPageScroll = useReportPageScroll()
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
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <DashboardTableShell className="min-h-0 min-w-0 flex-1">
        <ScrollArea
          className="h-full"
          scrollFade
          scrollbarGutter
          onViewportScroll={event => reportPageScroll(event.currentTarget.scrollTop)}
        >
          <GenerationsTable generations={generations} onSelect={handleSelect} />
        </ScrollArea>
      </DashboardTableShell>

      <SmartPagination meta={meta} className="shrink-0" />

      <GenerationDetailSheet generation={selected} open={sheetOpen} onOpenChange={handleOpenChange} />
    </div>
  )
}
