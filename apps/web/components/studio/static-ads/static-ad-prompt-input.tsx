'use client'

import { startStaticAdGeneration } from '@/actions/static-ad-generation.actions'
import {
  PromptInputButton,
  PromptInputProvider,
  usePromptInputController,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import type { AttachedMedia } from '@/components/files/attach-images-dialog'
import { StudioSkillPicker } from '@/components/skills/studio-skill-picker'
import { AspectRatioIcon } from '@/components/icons/aspect-ration.icon'
import { StudioInputActionTooltip } from '@/components/studio/prompt/studio-input-action-tooltip'
import {
  STUDIO_HOME_COMPOSER_SURFACE_CLASS,
  STUDIO_TOOL_BUTTON_CLASS,
  STUDIO_TOOL_CHEVRON_CLASS,
} from '@/components/studio/prompt/studio-composer-surface'
import { StudioPromptComposer } from '@/components/studio/prompt/studio-prompt-composer'
import { StudioReferenceTagHint } from '@/components/studio/prompt/studio-reference-tag-hint'
import {
  useStaticAdStudio,
  type StaticAdTemplateReference,
} from '@/components/studio/static-ads/static-ad-studio-provider'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DEFAULT_AD_LANGUAGE, LanguageSelector } from '@/components/ui/language-selector'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useWorkspaceBilling } from '@/hooks/use-workspace-billing'
import { storeGenerationAccessToken } from '@/lib/image-generation/session'
import { collectStaticAdImages } from '@/lib/studio/static-ads/collect-references'
import { STATIC_AD_STUDIO_PLACEHOLDER_EXAMPLES } from '@/lib/studio/studio-placeholder-examples'
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

const noop = () => {}

const COPY_FIELD_CLASS =
  'h-8 w-full rounded-lg bg-black/[0.04] px-2.5 text-[13px] tracking-[-0.015em] text-foreground outline-none placeholder:text-black/35 focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50 dark:bg-white/[0.06] dark:placeholder:text-white/35'

function StaticAdCopyFields({
  headline,
  cta,
  disabled,
  onHeadlineChange,
  onCtaChange,
}: {
  headline: string
  cta: string
  disabled: boolean
  onHeadlineChange: (value: string) => void
  onCtaChange: (value: string) => void
}) {
  return (
    <Collapsible className="px-3 sm:px-3.5">
      <CollapsibleTrigger
        type="button"
        className="group inline-flex h-7 items-center gap-1 text-[12px] font-medium tracking-[-0.015em] text-black/48 hover:text-foreground dark:text-white/48"
      >
        Headline and CTA
        <ChevronDownIcon className="size-3 transition-transform duration-150 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="grid gap-2 pt-1.5 pb-1 sm:grid-cols-2">
        <input
          value={headline}
          maxLength={40}
          placeholder="Headline"
          disabled={disabled}
          onChange={event => onHeadlineChange(event.target.value)}
          className={COPY_FIELD_CLASS}
        />
        <input
          value={cta}
          maxLength={20}
          placeholder="CTA"
          disabled={disabled}
          onChange={event => onCtaChange(event.target.value)}
          className={COPY_FIELD_CLASS}
        />
      </CollapsibleContent>
    </Collapsible>
  )
}

export type StaticAdPromptInputProps = {
  workspaceId: string
  models: Model[]
  hideExtras?: boolean
  bindStudio?: boolean
  autoFocus?: boolean
  initialPrompt?: string
  initialAttachments?: AttachedMedia[]
  initialTemplateReference?: StaticAdTemplateReference | null
  placeholder?: string
  surfaceClassName?: string
  hideTemplateName?: boolean
  showCopyFields?: boolean
}

type StaticAdPromptComposerProps = StaticAdPromptInputProps

function StaticAdPromptComposer({
  workspaceId,
  models,
  hideExtras = false,
  bindStudio = true,
  autoFocus,
  initialPrompt,
  initialAttachments,
  initialTemplateReference = null,
  placeholder: placeholderProp,
  surfaceClassName: surfaceClassNameProp,
  hideTemplateName = false,
  showCopyFields = false,
}: StaticAdPromptComposerProps) {
  const router = useRouter()
  const { textInput } = usePromptInputController()
  const setInput = textInput.setInput
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const projectId = useProjectStore(s => getProjectId(s.currentProject))
  const { credits } = useWorkspaceBilling()
  const studio = useStaticAdStudio()
  const localComposerRef = useRef<HTMLDivElement>(null)
  const composerRef = bindStudio ? studio.composerRef : localComposerRef

  const [localAspectRatio, setLocalAspectRatio] = useState<StaticAdAspectRatio>('1:1')
  const [localLanguage, setLocalLanguage] = useState(DEFAULT_AD_LANGUAGE)
  const aspectRatio = bindStudio ? studio.aspectRatio : localAspectRatio
  const setAspectRatio = bindStudio ? studio.setAspectRatio : setLocalAspectRatio
  const language = bindStudio ? studio.language : localLanguage
  const setLanguage = bindStudio ? studio.setLanguage : setLocalLanguage
  const clearActivePreset = bindStudio ? studio.clearActivePreset : noop
  const studioTemplateReference = studio.templateReference
  const clearTemplateReference = studio.clearTemplateReference
  const registerPromptHandlers = bindStudio ? studio.registerPromptHandlers : undefined

  const [localTemplateReference, setLocalTemplateReference] = useState<StaticAdTemplateReference | null>(
    initialTemplateReference,
  )
  const templateReference = bindStudio ? studioTemplateReference : localTemplateReference

  const [isPending, startTransition] = useTransition()
  const [attachments, setAttachments] = useState<AttachedMedia[]>(() =>
    initialAttachments?.length ? initialAttachments.slice(0, MAX_STATIC_AD_REFERENCES) : [],
  )
  const [selectedModelId, setSelectedModelId] = useState(() => {
    const preferred = models.find(model => model.value === STATIC_AD_MODEL)
    return preferred?._id ?? models[0]?._id ?? ''
  })
  const [numImages, setNumImages] = useState(IMAGE_GENERATION_COUNT_DEFAULT)
  const [skillId, setSkillId] = useState<string | undefined>()
  const [headline, setHeadline] = useState('')
  const [cta, setCta] = useState('')
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
    if (placeholderProp) return placeholderProp
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
  }, [attachments.length, placeholderProp, templateReference])

  const animatedPlaceholderWords = useMemo(() => {
    if (attachments.length > 0 || templateReference) return undefined
    return [...STATIC_AD_STUDIO_PLACEHOLDER_EXAMPLES]
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

  const setPrompt = useCallback(
    (text: string) => {
      textInput.setInput(text)
      requestAnimationFrame(() => {
        const el = textareaRef.current
        if (!el) return
        el.focus()
        el.setSelectionRange(text.length, text.length)
      })
    },
    [textInput],
  )

  const focusPrompt = useCallback(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!registerPromptHandlers) return
    registerPromptHandlers({
      setPrompt,
      getPrompt: () => textInputRef.current.value,
      setAspectRatio,
      insertAtCursor,
      focusPrompt,
    })
  }, [focusPrompt, insertAtCursor, registerPromptHandlers, setAspectRatio, setPrompt])

  useEffect(() => {
    if (!initialPrompt) return
    setInput(initialPrompt)
  }, [initialPrompt, setInput])

  useEffect(() => {
    if (autoFocus === false) return
    const shouldFocus = autoFocus ?? !hideExtras
    if (!shouldFocus) return
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: fine)').matches) return
    textareaRef.current?.focus()
  }, [autoFocus, hideExtras])

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
        ...(templateReference?.id ? { templateId: templateReference.id } : {}),
        ...(showCopyFields && (headline.trim() || cta.trim())
          ? {
              adCopy: {
                ...(headline.trim() ? { headline: headline.trim() } : {}),
                ...(cta.trim() ? { cta: cta.trim() } : {}),
              },
            }
          : {}),
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
      <div className="rounded-xl border border-dashed border-black/[0.08] bg-black/[0.015] px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.015]">
        <div className="mx-auto mb-4 flex size-9 items-center justify-center rounded-lg bg-black/[0.03] ring-1 ring-black/8 dark:bg-white/[0.03] dark:ring-white/10">
          <SparklesIcon className="size-3.5 text-black/48 dark:text-white/48" />
        </div>
        <p className="text-[15px] font-medium tracking-[-0.02em] text-foreground">No image-input models yet</p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-[1.55] tracking-[-0.01em] text-black/48 dark:text-white/48">
          Add a text-to-image model with image input support in the manager to start generating product ads.
        </p>
      </div>
    )
  }

  const selectedAspect = ASPECT_RATIOS.find(option => option.id === aspectRatio) ?? ASPECT_RATIOS[0]

  const aspectTools = (
    <DropdownMenu>
      <StudioInputActionTooltip label="Output aspect ratio">
        <DropdownMenuTrigger asChild>
          <PromptInputButton
            aria-label={`Aspect ratio ${selectedAspect.id}`}
            className={STUDIO_TOOL_BUTTON_CLASS}
            disabled={isPending}
            size="xs"
            type="button"
          >
            <AspectRatioIcon active ratio={selectedAspect.ratio} />
            <span className="text-[12px] font-medium leading-none tracking-[-0.015em]">
              {selectedAspect.id}
            </span>
            <ChevronDownIcon className={STUDIO_TOOL_CHEVRON_CLASS} />
          </PromptInputButton>
        </DropdownMenuTrigger>
      </StudioInputActionTooltip>
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
    <div className="static-ad-studio-prompt">
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
        animatedPlaceholderWords={animatedPlaceholderWords}
        pending={isPending}
        onSubmit={handleSubmit}
        submitLabel={numImages === 1 ? 'Generate' : `Generate ${numImages}`}
        submitTitle={
          !hasReferences
            ? 'Add a product, creator, or other reference first'
            : numImages === 1
              ? 'Generate'
              : `Generate ${numImages}`
        }
        submitAppearance="send"
        canSubmit={hasEnoughCredits && hasReferences}
        footerClassName="border-transparent bg-transparent px-2.5 pb-2 pt-1 sm:px-3"
        tools={
          <>
            {aspectTools}
            <StudioSkillPicker
              appearance="icon"
              target={PROMPT_KEYS.staticAd}
              value={skillId}
              onChange={setSkillId}
              disabled={isPending}
            />
            <LanguageSelector value={language} onChange={setLanguage} disabled={isPending} variant="ghost" />
            {!hasEnoughCredits ? (
              <Link
                href={DASHBOARD_ROUTES.UPGRADE}
                className="px-1.5 text-[11px] font-medium tracking-[-0.01em] text-destructive hover:underline"
              >
                Upgrade
              </Link>
            ) : null}
          </>
        }
        composerHeader={
          templateReference || showCopyFields ? (
            <div className="flex flex-col gap-1.5">
              {templateReference ? (
                <div className="flex items-center gap-2 px-3 sm:px-3.5">
                  <div className="relative size-8 shrink-0 overflow-hidden rounded-md ring-1 ring-black/10 dark:ring-white/12">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={templateReference.imageUrl} alt="" className="size-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[12px] font-medium tracking-[-0.015em] text-foreground">
                      Template reference
                    </p>
                    {!hideTemplateName && templateReference.name ? (
                      <p className="truncate text-[11px] text-black/44 dark:text-white/44">{templateReference.name}</p>
                    ) : (
                      <p className="truncate text-[11px] text-black/44 dark:text-white/44">
                        Recreate this ad with your product
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Remove template reference"
                    disabled={isPending}
                    className="flex size-6 items-center justify-center rounded-md text-black/40 transition-colors hover:bg-black/[0.05] hover:text-foreground active:scale-[0.97] motion-reduce:active:scale-100 dark:text-white/40 dark:hover:bg-white/[0.08]"
                    onClick={() => {
                      if (bindStudio) {
                        clearTemplateReference()
                      } else {
                        setLocalTemplateReference(null)
                      }
                    }}
                  >
                    <XIcon className="size-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              ) : null}
              {showCopyFields ? (
                <StaticAdCopyFields
                  headline={headline}
                  cta={cta}
                  disabled={isPending}
                  onHeadlineChange={setHeadline}
                  onCtaChange={setCta}
                />
              ) : null}
            </div>
          ) : null
        }
        composerHeaderClassName="border-black/[0.06] bg-transparent py-1.5 dark:border-white/[0.08]"
        textareaRef={node => {
          textareaRef.current = node
        }}
        composerRef={composerRef}
        onPromptChange={clearActivePreset}
        surfaceClassName={surfaceClassNameProp ?? STUDIO_HOME_COMPOSER_SURFACE_CLASS}
        emptyTitle="No image-input models yet"
        emptyDescription="Add a text-to-image model with image input support in the manager to start generating product ads."
      />

      {!hideExtras && attachments.length > 0 ? (
        <div className="mt-2.5 px-0.5">
          <StudioReferenceTagHint attachmentCount={attachments.length} variant="static-ad" />
        </div>
      ) : null}
    </div>
  )
}

export function StaticAdPromptInput(props: StaticAdPromptInputProps) {
  if (props.models.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-dashed border-border/80 bg-muted/15 px-6 py-14 text-center">
        <div className="mx-auto mb-4 flex size-9 items-center justify-center rounded-xl bg-background ring-1 ring-border/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
          <SparklesIcon className="size-3.5 text-muted-foreground" />
        </div>
        <p className="text-[15px] font-medium tracking-[-0.02em] text-foreground">No image-input models yet</p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-[1.55] tracking-[-0.01em] text-muted-foreground">
          Add a text-to-image model with image input support in the manager to start generating product ads.
        </p>
      </div>
    )
  }

  return (
    <PromptInputProvider initialInput={props.initialPrompt ?? ''}>
      <StaticAdPromptComposer {...props} />
    </PromptInputProvider>
  )
}
