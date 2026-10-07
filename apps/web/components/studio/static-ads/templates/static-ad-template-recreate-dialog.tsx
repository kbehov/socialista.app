'use client'

import { STUDIO_HERO_COMPOSER_SURFACE_CLASS } from '@/components/studio/prompt/studio-composer-surface'
import { StaticAdPromptInput } from '@/components/studio/static-ads/static-ad-prompt-input'
import {
  StudioTemplateRecreateDialog,
  useStudioTemplateRecreate,
  type StudioTemplateRecreateOverride,
} from '@/components/studio/templates/studio-template-recreate-dialog'
import {
  STATIC_AD_TEMPLATE_RECREATE_IDEAS,
  staticAdTemplateRecreatePrompt,
  staticAdTemplateToAttachments,
} from '@/lib/studio/static-ads/recreate-prompt'
import type { Model, StaticAdTemplateDto } from '@socialista/types'
import { useMemo } from 'react'

type StaticAdTemplateRecreateDialogProps = {
  template: StaticAdTemplateDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  models: Model[]
  workspaceId: string
  contextLabel?: string
  canGoPrevious?: boolean
  canGoNext?: boolean
  onGoPrevious?: () => void
  onGoNext?: () => void
}

function StaticAdTemplateRecreateComposer({
  models,
  workspaceId,
}: {
  models: Model[]
  workspaceId: string
}) {
  const { state } = useStudioTemplateRecreate()

  return (
    <StaticAdPromptInput
      workspaceId={workspaceId}
      models={models}
      hideExtras
      hideTemplateName
      bindStudio={false}
      autoFocus
      initialPrompt={state.prompt}
      initialAttachments={state.attachments}
      placeholder="Describe how to recreate this ad…"
      surfaceClassName={STUDIO_HERO_COMPOSER_SURFACE_CLASS}
    />
  )
}

export function StaticAdTemplateRecreateDialog({
  template,
  open,
  onOpenChange,
  models,
  workspaceId,
  contextLabel,
  canGoPrevious,
  canGoNext,
  onGoPrevious,
  onGoNext,
}: StaticAdTemplateRecreateDialogProps) {
  const recreateOverride = useMemo((): StudioTemplateRecreateOverride | null => {
    if (!template) return null
    return {
      id: template._id,
      previewUrl: template.imageUrl,
      attachments: staticAdTemplateToAttachments(template),
      initialPrompt: staticAdTemplateRecreatePrompt(),
    }
  }, [template])

  return (
    <StudioTemplateRecreateDialog
      template={null}
      recreateOverride={recreateOverride}
      open={open}
      onOpenChange={onOpenChange}
      ideas={STATIC_AD_TEMPLATE_RECREATE_IDEAS}
      resolveInitialPrompt={() => staticAdTemplateRecreatePrompt()}
      title="Recreate ad"
      description="Recreate this template. The reference image is already attached."
      contextLabel={contextLabel}
      canGoPrevious={canGoPrevious}
      canGoNext={canGoNext}
      onGoPrevious={onGoPrevious}
      onGoNext={onGoNext}
    >
      <StaticAdTemplateRecreateComposer models={models} workspaceId={workspaceId} />
    </StudioTemplateRecreateDialog>
  )
}
