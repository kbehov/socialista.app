'use client'

import { useImageStudio } from '@/components/studio/images/image-studio-provider'
import { StudioTemplatesGallery } from '@/components/studio/templates/studio-templates-gallery'
import { StudioTemplateKind } from '@socialista/types'

export function ImageTemplatesGallery() {
  const { applyTemplate } = useImageStudio()

  return (
    <StudioTemplatesGallery
      kind={StudioTemplateKind.IMAGE}
      onRecreate={applyTemplate}
      emptyDescription="Import image templates to start recreating trending visuals with your product."
    />
  )
}
