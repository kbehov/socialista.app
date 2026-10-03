'use client'

import { Filters, type Filter } from '@/components/reui/filters'
import { Button } from '@/components/ui/button'
import {
  applyModelFilters,
  buildManagerModelFilterFields,
  hasActiveModelFilters,
} from '@/lib/manager-model-filters'
import type { AiCompany, Model } from '@socialista/types'
import { ListFilterIcon } from 'lucide-react'
import { useMemo } from 'react'

type ModelsToolbarProps = {
  models: Model[]
  companies: AiCompany[]
  filters: Filter<string>[]
  onFiltersChange: (filters: Filter<string>[]) => void
}

export function ModelsToolbar({
  models,
  companies,
  filters,
  onFiltersChange,
}: ModelsToolbarProps) {
  const fields = useMemo(
    () => buildManagerModelFilterFields(models, companies),
    [companies, models],
  )
  const hasFilters = hasActiveModelFilters(filters)
  const filteredCount = useMemo(
    () => applyModelFilters(models, filters).length,
    [filters, models],
  )

  return (
    <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Filters
        filters={filters}
        fields={fields}
        onChange={onFiltersChange}
        size="sm"
        className="gap-2"
        trigger={
          <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg">
            <ListFilterIcon className="size-3.5" />
            Filters
          </Button>
        }
      />

      {hasFilters ? (
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredCount}</span> of{' '}
          <span className="font-medium text-foreground">{models.length}</span>
        </p>
      ) : null}
    </div>
  )
}
