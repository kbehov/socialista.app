'use client'

import { StudioTemplatesGallery } from '@/components/studio/templates/studio-templates-gallery'
import { StudioTemplateKind, type StudioTemplateCategoryDto, type StudioTemplateDto } from '@socialista/types'
import type { ReactNode } from 'react'

type InspirationKind = typeof StudioTemplateKind.IMAGE | typeof StudioTemplateKind.VIDEO

const EMPTY_DESCRIPTION: Record<InspirationKind, string> = {
  [StudioTemplateKind.IMAGE]:
    'When image inspirations are added, they will show up here so you can recreate them in one tap.',
  [StudioTemplateKind.VIDEO]:
    'When video inspirations are added, they will show up here so you can recreate them in one tap.',
}

type StudioInspirationsGalleryProps = {
  kind: InspirationKind
  templateCategories: StudioTemplateCategoryDto[]
  onRecreate: (template: StudioTemplateDto) => void
  onPreview?: (template: StudioTemplateDto) => void
  onReference?: (template: StudioTemplateDto) => void
  emptyDescription?: string
  emptyTitle?: string
  sectionTitle?: string
  headingTone?: 'display' | 'quiet'
  chipTone?: 'outline' | 'studio'
  hideTitle?: boolean
  className?: string
  sectionDescription?: string
  showCategoryCounts?: boolean
  featuredLabel?: string
  featuredCount?: number
  surpriseLabel?: string
  aboveGrid?: ReactNode
  onOpen?: (template: StudioTemplateDto, templates: StudioTemplateDto[]) => void
  gridEntrance?: boolean
  scrollTargetId?: string
  pinCategoryBar?: boolean
}

export function StudioInspirationsGallery({
  kind,
  templateCategories,
  onRecreate,
  onPreview,
  onReference,
  emptyDescription,
  emptyTitle = 'No inspirations yet',
  sectionTitle = 'Inspirations',
  headingTone = 'display',
  chipTone = 'outline',
  hideTitle,
  className,
  sectionDescription,
  showCategoryCounts,
  featuredLabel,
  featuredCount,
  surpriseLabel,
  aboveGrid,
  onOpen,
  gridEntrance,
  scrollTargetId,
  pinCategoryBar,
}: StudioInspirationsGalleryProps) {
  return (
    <StudioTemplatesGallery
      kind={kind}
      initialCategories={templateCategories}
      sectionTitle={sectionTitle}
      sectionDescription={sectionDescription}
      headingTone={headingTone}
      chipTone={chipTone}
      hideTitle={hideTitle}
      className={className}
      cardVariant="visual"
      onRecreate={onRecreate}
      onPreview={onPreview}
      onReference={onReference}
      onOpen={onOpen}
      showCategoryCounts={showCategoryCounts}
      featuredLabel={featuredLabel}
      featuredCount={featuredCount}
      surpriseLabel={surpriseLabel}
      aboveGrid={aboveGrid}
      gridEntrance={gridEntrance}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription ?? EMPTY_DESCRIPTION[kind]}
      scrollTargetId={scrollTargetId}
      pinCategoryBar={pinCategoryBar}
    />
  )
}
