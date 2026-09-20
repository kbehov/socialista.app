'use client'

import { StudioTemplatesGallery } from '@/components/studio/templates/studio-templates-gallery'
import { useVideoStudio } from '@/components/studio/videos/video-studio-provider'
import { StudioTemplateKind } from '@socialista/types'

export function VideoTemplatesGallery() {
  const { applyTemplate } = useVideoStudio()

  return (
    <StudioTemplatesGallery
      kind={StudioTemplateKind.VIDEO}
      onRecreate={applyTemplate}
      emptyDescription="Import video templates to start recreating trending clips with your product."
    />
  )
}
