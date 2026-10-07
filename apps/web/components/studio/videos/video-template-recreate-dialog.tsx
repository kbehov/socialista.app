'use client'

import { STUDIO_HERO_COMPOSER_SURFACE_CLASS } from '@/components/studio/prompt/studio-composer-surface'
import {
  StudioTemplateRecreateDialog,
  useStudioTemplateRecreate,
} from '@/components/studio/templates/studio-template-recreate-dialog'
import { VideoPromptInput } from '@/components/studio/videos/video-prompt-input'
import { VIDEO_TEMPLATE_RECREATE_IDEAS, videoTemplateRecreatePrompt } from '@/lib/studio/video-recreate'
import { StudioTemplateKind, type Model, type StudioTemplateDto } from '@socialista/types'

type VideoTemplateRecreateDialogProps = {
  template: StudioTemplateDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  models: Model[]
  contextLabel?: string
  canGoPrevious?: boolean
  canGoNext?: boolean
  onGoPrevious?: () => void
  onGoNext?: () => void
}

function VideoTemplateRecreateComposer({ models }: { models: Model[] }) {
  const { state } = useStudioTemplateRecreate()
  const payload =
    state.template?.kind === StudioTemplateKind.VIDEO ? state.template.payload : undefined

  return (
    <VideoPromptInput
      models={models}
      hideExtras
      recreateDialog
      bindStudio={false}
      autoFocus
      initialPrompt={state.prompt}
      initialAttachments={state.attachments}
      initialAspectRatio={payload?.aspectRatio}
      initialModel={payload?.model}
      initialDurationAuto
      initialResolution={payload?.resolution}
      initialGenerateAudio={payload?.generateAudio}
      placeholder="Describe how to recreate this video…"
      surfaceClassName={STUDIO_HERO_COMPOSER_SURFACE_CLASS}
    />
  )
}

export function VideoTemplateRecreateDialog({
  template,
  open,
  onOpenChange,
  models,
  contextLabel,
  canGoPrevious,
  canGoNext,
  onGoPrevious,
  onGoNext,
}: VideoTemplateRecreateDialogProps) {
  return (
    <StudioTemplateRecreateDialog
      template={template}
      open={open}
      onOpenChange={onOpenChange}
      ideas={VIDEO_TEMPLATE_RECREATE_IDEAS}
      resolveInitialPrompt={videoTemplateRecreatePrompt}
      title="Recreate video"
      description="Recreate this template. The reference is already attached."
      sessionClassName="max-w-[min(94vw,40rem)]"
      previewMediaClassName="max-h-[min(36vh,400px)] w-auto max-w-full rounded-xl object-contain shadow-[0_24px_64px_-24px_rgba(0,0,0,0.65)] outline outline-1 outline-white/10"
      scrollAreaClassName="items-start pt-6 pb-8 sm:items-center sm:py-12"
      contextLabel={contextLabel}
      canGoPrevious={canGoPrevious}
      canGoNext={canGoNext}
      onGoPrevious={onGoPrevious}
      onGoNext={onGoNext}
    >
      <VideoTemplateRecreateComposer models={models} />
    </StudioTemplateRecreateDialog>
  )
}
