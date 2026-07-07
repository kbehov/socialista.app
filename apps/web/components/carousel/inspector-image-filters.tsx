'use client'

import { FilterControls } from '@/components/media/filter-controls'
import type { MediaFilter, MediaFilterType } from '@/lib/media-filters'

export type InspectorImageFilterHandlers = {
  filters: MediaFilter[]
  onChange: (filter: MediaFilter) => void
  onCommit?: (filter: MediaFilter) => void
  onRemove: (type: MediaFilterType) => void
  onRemoveCommit?: (type: MediaFilterType) => void
}

export function InspectorImageFilters(props: InspectorImageFilterHandlers) {
  return <FilterControls {...props} />
}
