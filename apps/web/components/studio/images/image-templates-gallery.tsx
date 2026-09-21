'use client'

import { ImageTemplateRecreateDialog } from '@/components/studio/images/image-template-recreate-dialog'
import { StudioTemplatesGallery } from '@/components/studio/templates/studio-templates-gallery'
import { StudioTemplateKind, type Model, type StudioTemplateDto } from '@socialista/types'
import { useState } from 'react'

export function ImageTemplatesGallery({ models }: { models: Model[] }) {
  const [recreateTemplate, setRecreateTemplate] = useState<StudioTemplateDto | null>(null)

  return (
    <>
      <StudioTemplatesGallery
        kind={StudioTemplateKind.IMAGE}
        sectionTitle="Inspirations"
        cardVariant="visual"
        onRecreate={setRecreateTemplate}
        onPreview={setRecreateTemplate}
        emptyTitle="No inspirations yet"
        emptyDescription="When image inspirations are added, they will show up here so you can recreate them in one tap."
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
