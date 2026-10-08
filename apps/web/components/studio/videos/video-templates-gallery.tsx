'use client'

import { StudioInspirationsGallery } from '@/components/studio/templates/studio-inspirations-gallery'
import { useVideoStudio } from '@/components/studio/videos/video-studio-provider'
import { VideoTemplateRecents } from '@/components/studio/videos/video-template-recents'
import { VideoTemplateRecreateDialog } from '@/components/studio/videos/video-template-recreate-dialog'
import { rememberVideoTemplateRecent } from '@/lib/studio/video-template-recents'
import {
  StudioTemplateKind,
  type Model,
  type StudioTemplateCategoryDto,
  type StudioTemplateDto,
} from '@socialista/types'
import { useCallback, useEffect, useState } from 'react'

type VideoTemplatesGalleryProps = {
  models: Model[]
  templateCategories: StudioTemplateCategoryDto[]
  hideTitle?: boolean
  className?: string
  scrollTargetId?: string
  pinCategoryBar?: boolean
}

type RecreateBrowse = {
  templates: StudioTemplateDto[]
  index: number
}

export function VideoTemplatesGallery({
  models,
  templateCategories,
  hideTitle = false,
  className,
  scrollTargetId,
  pinCategoryBar,
}: VideoTemplatesGalleryProps) {
  const { attachReference } = useVideoStudio()
  const [browse, setBrowse] = useState<RecreateBrowse | null>(null)
  const template = browse?.templates[browse.index] ?? null
  const category = template?.categories[0]
  const contextLabel = template ? [template.name, category].filter(Boolean).join(' · ') : undefined

  useEffect(() => {
    if (template) rememberVideoTemplateRecent(template)
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
        kind={StudioTemplateKind.VIDEO}
        templateCategories={templateCategories}
        sectionTitle="Never run out of ideas ✨"
        sectionDescription="Recreate any video with your product in one tap."
        headingTone="display"
        chipTone="studio"
        hideTitle={hideTitle}
        className={className}
        showCategoryCounts
        surpriseLabel="Surprise me"
        aboveGrid={<VideoTemplateRecents onOpen={openTemplate} />}
        gridEntrance
        emptyTitle="No templates yet"
        emptyDescription="When templates are added, they show up here so you can recreate one in a tap."
        onRecreate={next => openTemplate(next, [next])}
        onReference={attachReference}
        onOpen={openTemplate}
        scrollTargetId={scrollTargetId}
        pinCategoryBar={pinCategoryBar}
      />
      <VideoTemplateRecreateDialog
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
