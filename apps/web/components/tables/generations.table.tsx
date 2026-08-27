'use client'

import { GENERATION_ROW_GRID, GenerationItem } from '@/components/generations/generation-item'
import { cn } from '@/lib/utils'
import type { Generation } from '@socialista/types'

type GenerationsTableProps = {
  generations: Generation[]
  onSelect: (generation: Generation) => void
  className?: string
}

export function GenerationsTable({ generations, onSelect, className }: GenerationsTableProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <div
        className={cn(
          'sticky top-0 z-10 hidden border-b border-foreground/10 bg-background py-2',
          GENERATION_ROW_GRID,
        )}
        aria-hidden
      >
        <span className="text-[11px] font-medium text-foreground/56">Generation</span>
        <span className="text-[11px] font-medium text-foreground/56">Kind</span>
        <span className="text-[11px] font-medium text-foreground/56">Status</span>
        <span className="hidden text-[11px] font-medium text-foreground/56 md:block">Model</span>
        <span className="hidden text-[11px] font-medium text-foreground/56 lg:block">Cost</span>
        <span className="hidden text-[11px] font-medium text-foreground/56 xl:block">Runtime</span>
        <span className="hidden text-[11px] font-medium text-foreground/56 lg:block">Created</span>
      </div>

      <ul className="divide-y divide-foreground/10">
        {generations.map((generation, index) => (
          <GenerationItem
            key={generation._id}
            generation={generation}
            index={index}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </div>
  )
}
