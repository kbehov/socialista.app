'use client'

import { startImageGeneration } from '@/actions/image-generation.actions'
import { startStaticAdGeneration } from '@/actions/static-ad-generation.actions'
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputController,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { STUDIO_COMPOSER_SURFACE_CLASS } from '@/components/studio/prompt/studio-composer-surface'
import { StudioInputActionTooltip } from '@/components/studio/prompt/studio-input-action-tooltip'
import { Kbd } from '@/components/ui/kbd'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { storeGenerationAccessToken } from '@/lib/image-generation/session'
import { cn } from '@/lib/utils'
import { commitHaptic } from '@/utils/haptics'
import { ASPECT_RATIOS, type AspectRatio } from '@socialista/types'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

type RemixPromptInputProps = {
  contentKind: 'image' | 'ad'
  imageUrl: string
  model: string
  workspaceId: string
  aspectRatio?: string
  projectId?: string
  language?: string
}

function resolveAspectRatio(value: string | undefined): AspectRatio {
  if (value && (ASPECT_RATIOS as readonly string[]).includes(value)) {
    return value as AspectRatio
  }
  return '1:1'
}

function RemixPromptComposer({
  contentKind,
  imageUrl,
  model,
  workspaceId,
  aspectRatio,
  projectId,
  language,
}: RemixPromptInputProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { textInput } = usePromptInputController()
  const isAd = contentKind === 'ad'
  const placeholder = isAd
    ? 'Describe how to edit this ad…'
    : 'Describe how to edit this image…'
  const submitLabel = isAd ? 'Edit ad' : 'Remix'
  const canSubmit = textInput.value.trim().length > 0 && !isPending

  const handleSubmit = (message: PromptInputMessage) => {
    const prompt = message.text.trim()
    if (!prompt) {
      toast.error('Add a prompt to remix this generation.')
      return
    }

    startTransition(async () => {
      const resolvedAspectRatio = resolveAspectRatio(aspectRatio)
      const result = isAd
        ? await startStaticAdGeneration({
            prompt,
            workspaceId,
            model,
            aspectRatio: resolvedAspectRatio,
            images: [{ url: imageUrl, role: 'upload', label: 'Current ad' }],
            language: language ?? 'en',
            numImages: 1,
            ...(projectId ? { projectId } : {}),
          })
        : await startImageGeneration({
            prompt,
            model,
            workspaceId,
            aspectRatio: resolvedAspectRatio,
            userId: '',
            imageUrls: [imageUrl],
            ...(projectId ? { projectId } : {}),
          })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      commitHaptic({ vibrateDuration: 10 })
      storeGenerationAccessToken(result.runId, result.publicAccessToken)
      router.push(
        isAd
          ? DASHBOARD_ROUTES.STUDIO.staticAdRun(result.runId)
          : DASHBOARD_ROUTES.STUDIO.imageRun(result.runId),
      )
    })
  }

  return (
    <PromptInput
      className={cn(
        'rounded-2xl border-black/10 bg-background transition-[border-color,ring-color] duration-200',
        'has-[[data-slot=input-group-control]:focus-visible]:border-black/18',
        'has-[[data-slot=input-group-control]:focus-visible]:ring-2',
        'has-[[data-slot=input-group-control]:focus-visible]:ring-ring/6',
        'dark:border-white/12',
        'dark:has-[[data-slot=input-group-control]:focus-visible]:border-white/20',
        STUDIO_COMPOSER_SURFACE_CLASS,
      )}
      onSubmit={handleSubmit}
    >
      <PromptInputBody>
        <PromptInputTextarea
          className={cn(
            'min-h-20 max-h-36 px-4 pt-3.5 pb-8 text-[15px] leading-[25px] tracking-[-0.18px]',
            'placeholder:text-muted-foreground/45',
          )}
          disabled={isPending}
          placeholder={placeholder}
        />
      </PromptInputBody>
      <PromptInputFooter className="border-t border-border/35 bg-muted/12 px-3 py-2.5 sm:px-3.5">
        <PromptInputTools>
          <p className="text-[12px] text-muted-foreground">
            {isAd ? 'Editing this ad' : 'Remixing this image'}
          </p>
        </PromptInputTools>
        <StudioInputActionTooltip label={isAd ? 'Edit this ad' : 'Remix this image'}>
          <PromptInputSubmit
            className={cn(
              'h-8 gap-1.5 rounded-lg px-3.5 text-[13px] font-medium tracking-[-0.015em]',
              'transition-[transform,opacity] duration-150 active:scale-[0.98]',
              !canSubmit && 'opacity-45',
            )}
            disabled={!canSubmit}
            size="sm"
            status={isPending ? 'submitted' : undefined}
          >
            {submitLabel}
            <Kbd className="ml-0.5 hidden h-5 min-w-5 border-primary-foreground/15 bg-primary-foreground/10 px-1 text-[10px] font-normal text-primary-foreground/85 lg:inline-flex">
              ⌘↵
            </Kbd>
          </PromptInputSubmit>
        </StudioInputActionTooltip>
      </PromptInputFooter>
    </PromptInput>
  )
}

export function RemixPromptInput(props: RemixPromptInputProps) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <h3 className="text-[15px] font-medium tracking-[-0.015em] text-foreground">
          {props.contentKind === 'ad' ? 'Edit this ad' : 'Remix'}
        </h3>
        <p className="text-[13px] leading-[1.5] text-black/56 dark:text-white/56">
          {props.contentKind === 'ad'
            ? 'Describe the change. We will regenerate from this ad.'
            : 'Describe the change. We will regenerate from this image.'}
        </p>
      </div>
      <PromptInputProvider>
        <RemixPromptComposer {...props} />
      </PromptInputProvider>
    </div>
  )
}
