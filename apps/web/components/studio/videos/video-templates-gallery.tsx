'use client'

import { StudioInspirationsGallery } from '@/components/studio/templates/studio-inspirations-gallery'
import { VideoTemplateRecreateDialog } from '@/components/studio/videos/video-template-recreate-dialog'
import {
  StudioTemplateKind,
  type Model,
  type StudioTemplateCategoryDto,
  type StudioTemplateDto,
} from '@socialista/types'
import { useState } from 'react'

type VideoTemplatesGalleryProps = {
  models: Model[]
  templateCategories: StudioTemplateCategoryDto[]
}

export function VideoTemplatesGallery({ models, templateCategories }: VideoTemplatesGalleryProps) {
  const [recreateTemplate, setRecreateTemplate] = useState<StudioTemplateDto | null>(null)

  return (
    <>
      <StudioInspirationsGallery
        kind={StudioTemplateKind.VIDEO}
        templateCategories={templateCategories}
        sectionTitle="Templates"
        headingTone="quiet"
        chipTone="studio"
        emptyTitle="No templates yet"
        emptyDescription="When templates are added, they show up here so you can recreate one in a tap."
        onRecreate={setRecreateTemplate}
        onPreview={setRecreateTemplate}
      />
      <VideoTemplateRecreateDialog
        template={recreateTemplate}
        open={recreateTemplate !== null}
        onOpenChange={open => {
          if (!open) setRecreateTemplate(null)
        }}
        models={models}
      />
    </>
  )
}
