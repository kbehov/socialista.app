'use client'

import { ImagePromptInput } from '@/components/studio/images/prompt-input'
import { STUDIO_HERO_COMPOSER_SURFACE_CLASS } from '@/components/studio/prompt/studio-composer-surface'
import {
  StudioTemplateRecreateDialog,
  useStudioTemplateRecreate,
} from '@/components/studio/templates/studio-template-recreate-dialog'
import { IMAGE_TEMPLATE_RECREATE_IDEAS, templateRecreatePrompt } from '@/lib/studio/image-recreate'
import { StudioTemplateKind, type Model, type StudioTemplateDto } from '@socialista/types'

type ImageTemplateRecreateDialogProps = {
  template: StudioTemplateDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  models: Model[]
}

function ImageTemplateRecreateComposer({ models }: { models: Model[] }) {
  const { state } = useStudioTemplateRecreate()
  const payload =
    state.template.kind === StudioTemplateKind.IMAGE ? state.template.payload : undefined

  return (
    <ImagePromptInput
      models={models}
      hideExtras
      bindStudio={false}
      autoFocus
      initialPrompt={state.prompt}
      initialAttachments={state.attachments}
      initialAspectRatio={payload?.aspectRatio}
      initialModel={payload?.model}
      placeholder="Describe how to recreate this image…"
      surfaceClassName={STUDIO_HERO_COMPOSER_SURFACE_CLASS}
    />
  )
}

export function ImageTemplateRecreateDialog({
  template,
  open,
  onOpenChange,
  models,
}: ImageTemplateRecreateDialogProps) {
  return (
    <StudioTemplateRecreateDialog
      template={template}
      open={open}
      onOpenChange={onOpenChange}
      ideas={IMAGE_TEMPLATE_RECREATE_IDEAS}
      resolveInitialPrompt={templateRecreatePrompt}
      title="Recreate image"
      description="Recreate this template. The reference image is already attached."
    >
      <ImageTemplateRecreateComposer models={models} />
    </StudioTemplateRecreateDialog>
  )
}
