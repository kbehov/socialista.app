'use client'

import { dashboardSurface } from '@/components/dashboard'
import { usePageScrollCompact } from '@/components/headers/page-scroll-compact'
import { Filters, type Filter } from '@/components/reui/filters'
import { Button } from '@/components/ui/button'
import { useFilesFilters } from '@/hooks/use-files-filters'
import {
  buildFileFilterFields,
  countActiveFileFilters,
  getFileTypesFromFilters,
  hasActiveFileFilters,
} from '@/lib/files/file-filters'
import { cn } from '@/lib/utils'
import { ImageIcon, ListFilterIcon, Loader2Icon, VideoIcon } from 'lucide-react'
import { useMemo } from 'react'

type FilesFiltersToolbarProps = {
  filters: Filter<string>[]
  /** Total files in the workspace or folder (from API meta). */
  total: number
  /** Matches after client-side type filter (loaded pages only). */
  visibleCount: number
}

export function FilesFiltersToolbar({ filters, total, visibleCount }: FilesFiltersToolbarProps) {
  const compact = usePageScrollCompact()
  const { isPending, applyFilters, clearFilters } = useFilesFilters()
  const hasFilters = hasActiveFileFilters(filters)
  const filterCount = countActiveFileFilters(filters)
  const typeFilterActive = getFileTypesFromFilters(filters).length > 0
  const fileWord = total === 1 ? 'file' : 'files'

  const fields = useMemo(() => {
    const base = buildFileFilterFields()
    return base.map(field => {
      if (field.key !== 'type' || !field.options) return field
      return {
        ...field,
        options: field.options.map(option => ({
          ...option,
          icon:
            option.value === 'image' ? (
              <ImageIcon className="size-3.5" strokeWidth={1.75} />
            ) : option.value === 'video' ? (
              <VideoIcon className="size-3.5" strokeWidth={1.75} />
            ) : undefined,
        })),
      }
    })
  }, [])

  return (
    <div
      className={cn(
        'sticky top-0 z-10 -mx-0.5 mb-4 flex flex-row items-center justify-between gap-2 px-0.5',
        'bg-background/80 backdrop-blur-xl backdrop-saturate-150',
        'supports-backdrop-filter:bg-background/60',
        compact ? 'pb-0.5' : 'pb-1',
        isPending && 'pointer-events-none opacity-60',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-row flex-nowrap items-center gap-2 overflow-x-auto">
        <Filters
          filters={filters}
          fields={fields}
          onChange={applyFilters}
          size="sm"
          className="gap-1.5"
          trigger={
            <Button
              variant="outline"
              size="sm"
              className={cn(dashboardSurface.toolbarControl, 'shrink-0 gap-1.5', hasFilters && 'text-foreground')}
            >
              <ListFilterIcon className="size-3.5" strokeWidth={1.75} />
              <span className={cn(compact && 'sr-only')}>Filters</span>
              {filterCount > 0 ? (
                <span
                  className={cn(
                    'flex items-center justify-center rounded-full bg-foreground font-medium text-background tabular-nums',
                    compact ? 'size-3.5 text-[9px]' : 'ml-0.5 size-4 text-[10px]',
                  )}
                >
                  {filterCount}
                </span>
              ) : null}
            </Button>
          }
        />
      </div>

      <div className="flex shrink-0 flex-row items-center gap-2 text-[12px] text-muted-foreground">
        {isPending ? <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" aria-hidden /> : null}
        <span className="tabular-nums tracking-tight">
          <span className="font-medium text-foreground">{total.toLocaleString()}</span>
          {typeFilterActive ? (
            <span className="text-muted-foreground"> · {visibleCount.toLocaleString()} shown</span>
          ) : null}
          {` ${fileWord}`}
        </span>
        {hasFilters ? (
          <>
            <span aria-hidden className="text-border">
              ·
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="font-medium text-foreground/80 underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clear
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
