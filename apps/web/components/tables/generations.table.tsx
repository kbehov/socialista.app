'use client'

import { GenerationItem } from '@/components/generations/generation-item'
import { TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { Generation } from '@socialista/types'

type GenerationsTableProps = {
  generations: Generation[]
  onSelect: (generation: Generation) => void
  className?: string
}

export function GenerationsTable({ generations, onSelect, className }: GenerationsTableProps) {
  return (
    <table className={cn('w-full caption-bottom text-sm', className)}>
      <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
        <TableRow className="border-border/60 bg-transparent hover:bg-transparent">
          <TableHead className="h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Generation
          </TableHead>
          <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:table-cell">
            Kind
          </TableHead>
          <TableHead className="h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Status
          </TableHead>
          <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase md:table-cell">
            Model
          </TableHead>
          <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell">
            Cost
          </TableHead>
          <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase xl:table-cell">
            Runtime
          </TableHead>
          <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell">
            Created
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {generations.map(generation => (
          <GenerationItem key={generation._id} generation={generation} onSelect={onSelect} />
        ))}
      </TableBody>
    </table>
  )
}
