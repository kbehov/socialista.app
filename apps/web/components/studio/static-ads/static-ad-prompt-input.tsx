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
import { collectStaticAdImages } from '@/lib/studio/static-ads/collect-references'
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
  STATIC_AD_MODEL,
  type Model,
} from '@socialista/types'
import { ChevronDownIcon, SparklesIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

const MAX_STATIC_AD_REFERENCES = 8

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
  models: Model[]
}

function StaticAdPromptComposer({ workspaceId, models }: StaticAdPromptComposerProps) {
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
  const [selectedModelId, setSelectedModelId] = useState(() => {
    const preferred = models.find(model => model.value === STATIC_AD_MODEL)
    return preferred?._id ?? models[0]?._id ?? ''
  })
  const [numImages, setNumImages] = useState(IMAGE_GENERATION_COUNT_DEFAULT)
  const [skillId, setSkillId] = useState<string | undefined>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const textInputRef = useRef(textInput)

  useEffect(() => {
    textInputRef.current = textInput
  })

  const referenceImages = collectStaticAdImages(attachments, templateReference)
  const hasReferences = referenceImages.length > 0
  const selectedModel = models.find(model => model._id === selectedModelId) ?? models[0]
  const billedCost = selectedModel ? selectedModel.cost * numImages : 0
  const hasEnoughCredits = !selectedModel || credits >= billedCost

  const placeholder = useMemo(() => {
    if (templateReference && attachments.length >= 2) {
      return 'recreate the template with the creator from @image1 holding the product from @image2…'
    }
    if (attachments.length >= 2) {
      return 'the creator from @image1 holding the product from @image2, bold headline, clean CTA…'
    }
    if (attachments.length === 1) {
      return 'UGC selfie with @image1, punchy hook and product-forward framing…'
    }
    if (templateReference) {
      return 'Optional brief — recreate this template with your product and creator.'
    }
    return DEFAULT_PLACEHOLDER
  }, [attachments.length, templateReference])

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
    const images = collectStaticAdImages(attachments, templateReference)

    if (images.length === 0) {
      toast.error('Add a product, creator, template, or other reference to generate.')
      return
    }

    if (!currentWorkspace?._id) {
      toast.error('Select a workspace to continue.')
      return
    }

    if (!selectedModel) {
      toast.error('Select a model to continue.')
      return
    }

    if (credits < billedCost) {
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
        model: selectedModel.value,
        aspectRatio,
        images,
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

  if (!selectedModel) {
    return (
      <div className="rounded-xl border border-dashed border-black/18 bg-background px-6 py-14 text-left dark:border-white/18">
        <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-black/[0.03] ring-1 ring-black/10 dark:bg-white/[0.04] dark:ring-white/12">
          <SparklesIcon className="size-4 text-black/56 dark:text-white/56" strokeWidth={2} />
        </div>
        <p className="text-[15px] font-medium tracking-[-0.02em] text-foreground">
          No image-input models yet
        </p>
        <p className="mt-2 max-w-sm text-[14px] leading-[1.55] tracking-[-0.01em] text-black/64 dark:text-white/64">
          Add a text-to-image model with image input support in the manager to start generating product ads.
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
        models={models}
        selectedModelId={selectedModel._id}
        onSelectedModelChange={setSelectedModelId}
        attachments={attachments}
        onAttachmentsChange={handleAttachmentsChange}
        attachSources={['upload', 'library', 'product', 'influencer']}
        maxAttachments={MAX_STATIC_AD_REFERENCES}
        minAttachments={1}
        requirePrompt={false}
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
        canSubmit={hasEnoughCredits && hasReferences}
        submitTitle={!hasReferences ? 'Add a product, creator, or other reference first' : undefined}
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
              <div className="flex items-center gap-2.5 rounded-[10px] bg-black/[0.03] px-2 py-1.5 ring-1 ring-black/10 dark:bg-white/[0.04] dark:ring-white/12">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/10 dark:ring-white/12">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={templateReference.imageUrl}
                    alt={templateReference.name ?? 'Template reference'}
                    className="size-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[12px] font-medium tracking-[-0.015em] text-foreground">
                    Template reference
                  </p>
                  <p className="truncate text-[12px] text-black/56 dark:text-white/56">
                    {templateReference.name ?? 'Recreate this ad with your product'}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Remove template reference"
                  disabled={isPending}
                  className="flex size-7 items-center justify-center rounded-full text-black/44 transition-colors hover:bg-black/[0.05] hover:text-foreground active:scale-[0.97] motion-reduce:active:scale-100 dark:text-white/44 dark:hover:bg-white/[0.08]"
                  onClick={clearTemplateReference}
                >
                  <XIcon className="size-3.5" strokeWidth={2} />
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
        emptyTitle="No image-input models yet"
        emptyDescription="Add a text-to-image model with image input support in the manager to start generating product ads."
      />

      <div className="mt-3 px-0.5">
        <StudioReferenceTagHint attachmentCount={attachments.length} variant="static-ad" />
      </div>

      {templateReference && attachments.length === 0 ? (
        <p
          className="mt-3 px-0.5 text-left text-[13px] leading-[1.5] tracking-[-0.01em] text-black/56 dark:text-white/56"
          role="status"
        >
          Add your product and/or creator — we will map them onto this template.
        </p>
      ) : !hasReferences ? (
        <p
          className="mt-3 px-0.5 text-left text-[13px] leading-[1.5] tracking-[-0.01em] text-black/56 dark:text-white/56"
          role="status"
        >
          Add a product, creator, template, or mix — tag them with @image1, @image2…
        </p>
      ) : null}

      {hasReferences ? (
        <p className="mt-4 flex flex-wrap items-center gap-1.5 px-0.5 text-left text-[12px] tracking-[-0.01em] text-black/44 dark:text-white/44">
          <Kbd className="h-4 min-w-4 border-black/10 bg-black/[0.03] px-1 text-[10px] text-black/56 dark:border-white/12 dark:bg-white/[0.04] dark:text-white/56">
            /
          </Kbd>
          <span>to focus</span>
          <span aria-hidden className="text-black/20 dark:text-white/20">
            ·
          </span>
          <Kbd className="h-4 min-w-4 border-black/10 bg-black/[0.03] px-1 text-[10px] text-black/56 dark:border-white/12 dark:bg-white/[0.04] dark:text-white/56">
            {submitShortcut}
          </Kbd>
          <span>to generate</span>
        </p>
      ) : null}
    </div>
  )
}

export function StaticAdPromptInput({
  workspaceId,
  models,
}: {
  workspaceId: string
  models: Model[]
}) {
  return (
    <PromptInputProvider>
      <StaticAdPromptComposer models={models} workspaceId={workspaceId} />
    </PromptInputProvider>
  )
}
