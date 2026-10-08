'use client'

import { STUDIO_HERO_COMPOSER_SURFACE_CLASS } from '@/components/studio/prompt/studio-composer-surface'
import { StaticAdPromptInput } from '@/components/studio/static-ads/static-ad-prompt-input'
import {
  StudioTemplateRecreateDialog,
  useStudioTemplateRecreate,
  type StudioTemplateRecreateOverride,
} from '@/components/studio/templates/studio-template-recreate-dialog'
import {
  STATIC_AD_RECREATE_PROMPT,
  staticAdTemplateRecreateIdeaIndex,
  staticAdTemplateRecreateIdeas,
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
  template,
}: {
  models: Model[]
  workspaceId: string
  template: StaticAdTemplateDto | null
}) {
  const { state } = useStudioTemplateRecreate()
  if (!template) return null

  return (
    <StaticAdPromptInput
      workspaceId={workspaceId}
      models={models}
      hideExtras
      hideTemplateName
      bindStudio={false}
      autoFocus
      showCopyFields
      initialPrompt={state.prompt}
      initialAttachments={state.attachments}
      initialTemplateReference={{
        id: template._id,
        imageUrl: template.imageUrl,
        ...(template.name ? { name: template.name } : {}),
      }}
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
  const session = useMemo(() => {
    if (!template) return null
    const ideas = staticAdTemplateRecreateIdeas(template)
    const index = staticAdTemplateRecreateIdeaIndex(template._id, ideas.length)
    return {
      ideas,
      override: {
        id: template._id,
        previewUrl: template.imageUrl,
        attachments: [],
        initialPrompt: ideas[index]?.prompt ?? STATIC_AD_RECREATE_PROMPT,
      } satisfies StudioTemplateRecreateOverride,
    }
  }, [template])

  return (
    <StudioTemplateRecreateDialog
      template={null}
      recreateOverride={session?.override ?? null}
      open={open}
      onOpenChange={onOpenChange}
      ideas={session?.ideas ?? []}
      resolveInitialPrompt={() => session?.override.initialPrompt ?? STATIC_AD_RECREATE_PROMPT}
      title="Recreate ad"
      description="Recreate this template. The reference image is already attached."
      contextLabel={contextLabel}
      canGoPrevious={canGoPrevious}
      canGoNext={canGoNext}
      onGoPrevious={onGoPrevious}
      onGoNext={onGoNext}
    >
      <StaticAdTemplateRecreateComposer template={template} models={models} workspaceId={workspaceId} />
    </StudioTemplateRecreateDialog>
  )
}
