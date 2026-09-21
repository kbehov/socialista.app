'use client'

import { StudioTemplatesGallery } from '@/components/studio/templates/studio-templates-gallery'
import { useVideoStudio } from '@/components/studio/videos/video-studio-provider'
import { StudioTemplateKind, type StudioTemplateCategoryDto } from '@socialista/types'

type VideoTemplatesGalleryProps = {
  templateCategories: StudioTemplateCategoryDto[]
}

export function VideoTemplatesGallery({ templateCategories }: VideoTemplatesGalleryProps) {
  const { applyTemplate } = useVideoStudio()

  return (
    <StudioTemplatesGallery
      kind={StudioTemplateKind.VIDEO}
      initialCategories={templateCategories}
      onRecreate={applyTemplate}
      emptyDescription="Import video templates to start recreating trending clips with your product."
    />
  )
}
