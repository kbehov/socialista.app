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
  hideTitle?: boolean
}

export function ImageTemplatesGallery({ models, templateCategories, hideTitle = false }: ImageTemplatesGalleryProps) {
  const [recreateTemplate, setRecreateTemplate] = useState<StudioTemplateDto | null>(null)

  return (
    <>
      <StudioInspirationsGallery
        kind={StudioTemplateKind.IMAGE}
        templateCategories={templateCategories}
        sectionTitle=" Unblock your creativity"
        headingTone="quiet"
        chipTone="studio"
        hideTitle={hideTitle}
        emptyTitle="No templates yet"
        emptyDescription="When templates are added, they show up here so you can recreate one in a tap."
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
