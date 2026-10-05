'use client'

import { ImageTemplateRecents } from '@/components/studio/images/image-template-recents'
import { ImageTemplateRecreateDialog } from '@/components/studio/images/image-template-recreate-dialog'
import { StudioInspirationsGallery } from '@/components/studio/templates/studio-inspirations-gallery'
import { rememberImageTemplateRecent } from '@/lib/studio/image-template-recents'
import {
  StudioTemplateKind,
  type Model,
  type StudioTemplateCategoryDto,
  type StudioTemplateDto,
} from '@socialista/types'
import { useCallback, useEffect, useState } from 'react'

type ImageTemplatesGalleryProps = {
  models: Model[]
  templateCategories: StudioTemplateCategoryDto[]
  hideTitle?: boolean
  className?: string
}

type RecreateBrowse = {
  templates: StudioTemplateDto[]
  index: number
}

export function ImageTemplatesGallery({
  models,
  templateCategories,
  hideTitle = false,
  className,
}: ImageTemplatesGalleryProps) {
  const [browse, setBrowse] = useState<RecreateBrowse | null>(null)
  const template = browse?.templates[browse.index] ?? null
  const category = template?.categories[0]
  const contextLabel = template ? [template.name, category].filter(Boolean).join(' · ') : undefined

  useEffect(() => {
    if (template) rememberImageTemplateRecent(template)
  }, [template])

  const openTemplate = useCallback((next: StudioTemplateDto, list: StudioTemplateDto[]) => {
    const index = list.findIndex(item => item._id === next._id)
    setBrowse({ templates: list, index: index < 0 ? 0 : index })
  }, [])

  const go = useCallback((direction: -1 | 1) => {
    setBrowse(current => {
      if (!current) return current
      const index = current.index + direction
      if (index < 0 || index >= current.templates.length) return current
      return { ...current, index }
    })
  }, [])

  const canBrowse = (browse?.templates.length ?? 0) > 1

  return (
    <>
      <StudioInspirationsGallery
        kind={StudioTemplateKind.IMAGE}
        templateCategories={templateCategories}
        sectionTitle="Never run out of ideas ✨"
        sectionDescription="Recreate any look with your product in one tap."
        headingTone="display"
        chipTone="studio"
        hideTitle={hideTitle}
        className={className}
        showCategoryCounts
        featuredLabel="🔥 Trending this week"
        featuredCount={6}
        surpriseLabel="Surprise me"
        aboveGrid={<ImageTemplateRecents onOpen={openTemplate} />}
        gridEntrance
        emptyTitle="No templates yet"
        emptyDescription="When templates are added, they show up here so you can recreate one in a tap."
        onRecreate={next => openTemplate(next, [next])}
        onOpen={openTemplate}
      />
      <ImageTemplateRecreateDialog
        template={template}
        open={template !== null}
        onOpenChange={open => {
          if (!open) setBrowse(null)
        }}
        models={models}
        contextLabel={contextLabel || undefined}
        canGoPrevious={Boolean(browse && browse.index > 0)}
        canGoNext={Boolean(browse && browse.index < browse.templates.length - 1)}
        onGoPrevious={canBrowse ? () => go(-1) : undefined}
        onGoNext={canBrowse ? () => go(1) : undefined}
      />
    </>
  )
}
