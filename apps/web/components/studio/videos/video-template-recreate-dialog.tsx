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
}

function VideoTemplateRecreateComposer({ models }: { models: Model[] }) {
  const { state } = useStudioTemplateRecreate()
  const payload =
    state.template.kind === StudioTemplateKind.VIDEO ? state.template.payload : undefined

  return (
    <VideoPromptInput
      models={models}
      hideExtras
      bindStudio={false}
      autoFocus
      initialPrompt={state.prompt}
      initialAttachments={state.attachments}
      initialAspectRatio={payload?.aspectRatio}
      initialModel={payload?.model}
      initialDuration={payload?.durationSec}
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
    >
      <VideoTemplateRecreateComposer models={models} />
    </StudioTemplateRecreateDialog>
  )
}
