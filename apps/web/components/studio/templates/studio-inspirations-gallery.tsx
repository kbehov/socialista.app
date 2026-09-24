'use client'

import { StudioTemplatesGallery } from '@/components/studio/templates/studio-templates-gallery'
import {
  StudioTemplateKind,
  type StudioTemplateCategoryDto,
  type StudioTemplateDto,
} from '@socialista/types'

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
  emptyDescription?: string
  emptyTitle?: string
  sectionTitle?: string
  headingTone?: 'display' | 'quiet'
  chipTone?: 'outline' | 'studio'
}

export function StudioInspirationsGallery({
  kind,
  templateCategories,
  onRecreate,
  onPreview,
  emptyDescription,
  emptyTitle = 'No inspirations yet',
  sectionTitle = 'Inspirations',
  headingTone = 'display',
  chipTone = 'outline',
}: StudioInspirationsGalleryProps) {
  return (
    <StudioTemplatesGallery
      kind={kind}
      initialCategories={templateCategories}
      sectionTitle={sectionTitle}
      headingTone={headingTone}
      chipTone={chipTone}
      cardVariant="visual"
      onRecreate={onRecreate}
      onPreview={onPreview}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription ?? EMPTY_DESCRIPTION[kind]}
    />
  )
}
