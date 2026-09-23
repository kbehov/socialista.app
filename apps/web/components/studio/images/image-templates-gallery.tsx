'use client'

import { ImageTemplateRecreateDialog } from '@/components/studio/images/image-template-recreate-dialog'
import { StudioInspirationsGallery } from '@/components/studio/templates/studio-inspirations-gallery'
import {
  StudioTemplateKind,
  type Model,
  type StudioTemplateCategoryDto,
  type StudioTemplateDto,
} from '@socialista/types'
import { useState } from 'react'

type ImageTemplatesGalleryProps = {
  models: Model[]
  templateCategories: StudioTemplateCategoryDto[]
}

export function ImageTemplatesGallery({ models, templateCategories }: ImageTemplatesGalleryProps) {
  const [recreateTemplate, setRecreateTemplate] = useState<StudioTemplateDto | null>(null)

  return (
    <>
      <StudioInspirationsGallery
        kind={StudioTemplateKind.IMAGE}
        templateCategories={templateCategories}
        onRecreate={setRecreateTemplate}
        onPreview={setRecreateTemplate}
      />
      <ImageTemplateRecreateDialog
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
