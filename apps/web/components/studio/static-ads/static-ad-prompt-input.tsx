'use client'

import { startStaticAdGeneration } from '@/actions/static-ad-generation.actions'
import {
  PromptInputButton,
  PromptInputProvider,
  usePromptInputController,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import type { AttachedMedia } from '@/components/files/attach-images-dialog'
import { AspectRatioIcon } from '@/components/icons/aspect-ration.icon'
import { StudioSkillPicker } from '@/components/skills/studio-skill-picker'
import { STUDIO_COMPOSER_SURFACE_CLASS } from '@/components/studio/prompt/studio-composer-surface'
import { StudioPromptComposer } from '@/components/studio/prompt/studio-prompt-composer'
import { StudioReferenceTagHint } from '@/components/studio/prompt/studio-reference-tag-hint'
import { StaticAdFormatPresets } from '@/components/studio/static-ads/static-ad-format-presets'
import { StaticAdPromptAnatomy } from '@/components/studio/static-ads/static-ad-prompt-anatomy'
import { useStaticAdStudio } from '@/components/studio/static-ads/static-ad-studio-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Kbd } from '@/components/ui/kbd'
import { LanguageSelector } from '@/components/ui/language-selector'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useWorkspaceBilling } from '@/hooks/use-workspace-billing'
import { storeGenerationAccessToken } from '@/lib/image-generation/session'
import { resolveStaticAdProductImage } from '@/lib/studio/static-ads/resolve-product-image'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/workspace.store'
import { getProjectId, useProjectStore } from '@/store/project.store'
import type { StaticAdAspectRatio } from '@/types/static-ads.types'
import { commitHaptic } from '@/utils/haptics'
import {
  IMAGE_GENERATION_COUNT_DEFAULT,
  IMAGE_GENERATION_COUNT_MAX,
  IMAGE_GENERATION_COUNT_MIN,
  PROMPT_KEYS,
  type Model,
} from '@socialista/types'
import { ChevronDownIcon, SparklesIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

const MAX_STATIC_AD_REFERENCES = 3

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square', ratio: 1 },
  { id: '9:16', label: 'Story', ratio: 9 / 16 },
  { id: '16:9', label: 'Landscape', ratio: 16 / 9 },
  { id: '4:3', label: 'Classic', ratio: 4 / 3 },
] as const satisfies ReadonlyArray<{
  id: StaticAdAspectRatio
  label: string
  ratio: number
}>

const DEFAULT_PLACEHOLDER =
  'Optional brief — tone, audience, or headline. Leave empty and we invent from your references.'

function getSubmitShortcutLabel() {
  if (typeof navigator === 'undefined') return '⌘↵'
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? navigator.userAgent) ? '⌘↵' : 'Ctrl↵'
}

type StaticAdPromptComposerProps = {
  workspaceId: string
  model: Model | null
}

function StaticAdPromptComposer({ workspaceId, model }: StaticAdPromptComposerProps) {
  const router = useRouter()
  const [submitShortcut] = useState(getSubmitShortcutLabel)
  const { textInput } = usePromptInputController()
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const projectId = useProjectStore(s => getProjectId(s.currentProject))
  const { credits } = useWorkspaceBilling()
  const {
    composerRef,
    aspectRatio,
    setAspectRatio,
    language,
    setLanguage,
    registerPromptHandlers,
    clearActivePreset,
    templateReference,
    clearTemplateReference,
  } = useStaticAdStudio()

  const [isPending, startTransition] = useTransition()
  const [attachments, setAttachments] = useState<AttachedMedia[]>([])
  const [numImages, setNumImages] = useState(IMAGE_GENERATION_COUNT_DEFAULT)
  const [skillId, setSkillId] = useState<string | undefined>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const textInputRef = useRef(textInput)

  useEffect(() => {
    textInputRef.current = textInput
  })

  const productImage = resolveStaticAdProductImage(attachments)
  const hasProductImage = Boolean(productImage)
  const billedCost = model ? model.cost * numImages : 0
  const hasEnoughCredits = !model || credits >= billedCost

  const placeholder = useMemo(() => {
    if (attachments.length >= 2) {
      return 'the creator from @image1 holding the product from @image2, bold headline, clean CTA…'
    }
    if (attachments.length === 1) {
      return 'UGC selfie with @image1, punchy hook and product-forward framing…'
    }
    return DEFAULT_PLACEHOLDER
  }, [attachments.length])

  const insertAtCursor = useCallback(
    (snippet: string) => {
      const el = textareaRef.current
      const current = textInput.value

      if (!el) {
        textInput.setInput(current ? `${current}${snippet}` : snippet)
        clearActivePreset()
        return
      }

      const start = el.selectionStart ?? current.length
      const end = el.selectionEnd ?? current.length
      const separator = current.length > 0 && start > 0 && !/\s$/.test(current.slice(0, start)) ? ', ' : ''
      const next = `${current.slice(0, start)}${separator}${snippet}${current.slice(end)}`
      textInput.setInput(next)
      clearActivePreset()

      requestAnimationFrame(() => {
        const position = start + separator.length + snippet.length
        el.focus()
        el.setSelectionRange(position, position)
      })
    },
    [clearActivePreset, textInput],
  )

  const focusPrompt = useCallback(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    registerPromptHandlers({
      setPrompt: value => textInputRef.current.setInput(value),
      getPrompt: () => textInputRef.current.value,
      setAspectRatio,
      insertAtCursor,
      focusPrompt,
    })
  }, [focusPrompt, insertAtCursor, registerPromptHandlers, setAspectRatio])

  const handleAttachmentsChange = useCallback(
    (next: AttachedMedia[]) => {
      setAttachments(next)
      clearActivePreset()
    },
    [clearActivePreset],
  )

  const handleSubmit = (message: PromptInputMessage) => {
    const prompt = message.text.trim()
    const imageUrl = productImage?.url

    if (!imageUrl) {
      toast.error('Add a product photo to generate.')
      return
    }

    if (!currentWorkspace?._id) {
      toast.error('Select a workspace to continue.')
      return
    }

    if (model && credits < billedCost) {
      toast.error('Insufficient AI credits.', {
        action: {
          label: 'Upgrade',
          onClick: () => router.push(DASHBOARD_ROUTES.UPGRADE),
        },
      })
      return
    }

    startTransition(async () => {
      const result = await startStaticAdGeneration({
        ...(prompt ? { prompt } : {}),
        workspaceId: currentWorkspace._id,
        aspectRatio,
        productImage: imageUrl,
        ...(templateReference?.imageUrl ? { referenceImage: templateReference.imageUrl } : {}),
        language,
        numImages,
        ...(skillId ? { skillId } : {}),
        ...(projectId ? { projectId } : {}),
      })

      if (!result.success) {
        if (result.error.toLowerCase().includes('insufficient')) {
          toast.error(result.error, {
            action: {
              label: 'Upgrade',
              onClick: () => router.push(DASHBOARD_ROUTES.UPGRADE),
            },
          })
          return
        }
        toast.error(result.error)
        return
      }

      commitHaptic({ vibrateDuration: 10 })
      storeGenerationAccessToken(result.runId, result.publicAccessToken)
      router.push(DASHBOARD_ROUTES.STUDIO.staticAdRun(result.runId))
    })
  }

  if (!model) {
    return (
      <div className="rounded-[1.375rem] border border-dashed border-border/50 bg-background/75 px-6 py-14 text-center backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-2xl bg-muted/40 ring-1 ring-border/35">
          <SparklesIcon className="size-4 text-muted-foreground/80" />
        </div>
        <p className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
          Static ad model not configured
        </p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-[1.55] tracking-[-0.01em] text-muted-foreground">
          Add GPT Image 2 in the model manager to start generating product ads.
        </p>
      </div>
    )
  }

  const selectedAspect =
    ASPECT_RATIOS.find(option => option.id === aspectRatio) ?? ASPECT_RATIOS[0]

  const aspectTools = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <PromptInputButton
          aria-label={`Aspect ratio ${selectedAspect.id}`}
          className={cn(
            'h-7 gap-1.5 rounded-xl border px-1.5 pr-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
            'border-border/40 bg-background/90 transition-[border-color,background-color,box-shadow] duration-150',
            'hover:border-border/65 hover:bg-background',
            'active:scale-[0.97]',
          )}
          disabled={isPending}
          type="button"
        >
          <AspectRatioIcon active ratio={selectedAspect.ratio} />
          <span className="text-xs font-medium leading-none tracking-[-0.015em]">
            {selectedAspect.id}
          </span>
          <ChevronDownIcon className="size-3 shrink-0 text-muted-foreground/60" />
        </PromptInputButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44 w-44">
        <DropdownMenuRadioGroup
          value={aspectRatio}
          onValueChange={value => setAspectRatio(value as StaticAdAspectRatio)}
        >
          {ASPECT_RATIOS.map(option => (
            <DropdownMenuRadioItem key={option.id} className="gap-2.5 rounded-lg" value={option.id}>
              <AspectRatioIcon active={aspectRatio === option.id} ratio={option.ratio} />
              <span className="text-[13px] font-medium tracking-[-0.015em]">{option.label}</span>
              <DropdownMenuShortcut>{option.id}</DropdownMenuShortcut>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div>
      <StudioPromptComposer
        models={[model]}
        selectedModelId={model._id}
        onSelectedModelChange={() => {}}
        attachments={attachments}
        onAttachmentsChange={handleAttachmentsChange}
        attachSources={['upload', 'library', 'product', 'influencer']}
        maxAttachments={MAX_STATIC_AD_REFERENCES}
        minAttachments={1}
        requirePrompt={false}
        hideModelSelector
        workspaceId={workspaceId}
        count={{
          value: numImages,
          min: IMAGE_GENERATION_COUNT_MIN,
          max: IMAGE_GENERATION_COUNT_MAX,
          onChange: setNumImages,
          label: 'Number of images',
        }}
        placeholder={placeholder}
        pending={isPending}
        onSubmit={handleSubmit}
        submitLabel={numImages === 1 ? 'Generate' : `Generate ${numImages}`}
        canSubmit={hasEnoughCredits && hasProductImage}
        submitTitle={!hasProductImage ? 'Add a product photo first' : undefined}
        tools={
          <>
            {aspectTools}
            <StudioSkillPicker
              target={PROMPT_KEYS.staticAd}
              value={skillId}
              onChange={setSkillId}
              disabled={isPending}
            />
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              disabled={isPending}
              className="h-7"
            />
            {!hasEnoughCredits ? (
              <Link
                href={DASHBOARD_ROUTES.UPGRADE}
                className="text-[11px] font-medium text-destructive hover:underline"
              >
                Upgrade
              </Link>
            ) : null}
          </>
        }
        composerHeader={
          <div className="flex flex-col gap-3">
            {templateReference ? (
              <div className="flex items-center gap-2.5 rounded-2xl bg-muted/35 px-2 py-1.5 ring-1 ring-border/40">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={templateReference.imageUrl}
                    alt={templateReference.name ?? 'Template reference'}
                    className="size-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold tracking-[-0.02em] text-foreground">
                    Template reference
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {templateReference.name ?? 'Recreate this ad with your product'}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Remove template reference"
                  disabled={isPending}
                  className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground active:scale-[0.97] motion-reduce:active:scale-100"
                  onClick={clearTemplateReference}
                >
                  <XIcon className="size-3.5" strokeWidth={2.25} />
                </button>
              </div>
            ) : null}
            <StaticAdFormatPresets />
          </div>
        }
        textareaRef={node => {
          textareaRef.current = node
        }}
        composerRef={composerRef}
        onPromptChange={clearActivePreset}
        surfaceClassName={STUDIO_COMPOSER_SURFACE_CLASS}
        emptyTitle="Static ad model not configured"
        emptyDescription="Add GPT Image 2 in the model manager to start generating product ads."
      />

      <div className="mt-3 px-0.5">
        <StudioReferenceTagHint attachmentCount={attachments.length} variant="static-ad" />
      </div>

      {!hasProductImage ? (
        <p
          className="mt-3 px-0.5 text-[12px] leading-[1.5] tracking-[-0.01em] text-muted-foreground/70"
          role="status"
        >
          {templateReference
            ? 'Add a product photo to recreate this template with your product.'
            : 'Start with a product photo — add an avatar or style reference for richer briefs.'}
        </p>
      ) : null}

      <div className="mt-6 space-y-5">
        <StaticAdPromptAnatomy />

        {hasProductImage ? (
          <p className="flex flex-wrap items-center justify-center gap-1.5 px-0.5 text-[11px] tracking-[-0.01em] text-muted-foreground/50">
            <Kbd className="h-4 min-w-4 border-border/35 bg-muted/25 px-1 text-[10px] text-muted-foreground/65">
              /
            </Kbd>
            <span>to focus</span>
            <span aria-hidden className="text-muted-foreground/20">
              ·
            </span>
            <Kbd className="h-4 min-w-4 border-border/35 bg-muted/25 px-1 text-[10px] text-muted-foreground/65">
              {submitShortcut}
            </Kbd>
            <span>to generate</span>
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function StaticAdPromptInput({
  workspaceId,
  model,
}: {
  workspaceId: string
  model: Model | null
}) {
  return (
    <PromptInputProvider>
      <StaticAdPromptComposer model={model} workspaceId={workspaceId} />
    </PromptInputProvider>
  )
}
