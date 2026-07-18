'use client'

import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputController,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { AspectRatioIcon } from '@/components/icons/aspect-ration.icon'
import { AddProductTrigger } from '@/components/products/add-product-trigger'
import { LanguageSelector } from '@/components/ui/language-selector'
import { Kbd } from '@/components/ui/kbd'
import { Separator } from '@/components/ui/separator'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useWorkspaceBilling } from '@/hooks/use-workspace-billing'
import { storeGenerationAccessToken } from '@/lib/image-generation/session'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/workspace.store'
import { commitHaptic } from '@/utils/haptics'
import { formatModelCost } from '@/utils/format'
import type { Model, Product } from '@socialista/types'
import { AlertCircleIcon, ImagePlusIcon, PackageIcon, SparklesIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { startStaticAdGeneration } from '../_actions/generation'
import type { StaticAdAspectRatio } from '../_lib/types'
import { ProductPickerDialog } from './product-picker-dialog'
import { StaticAdFormatPresets } from './static-ad-format-presets'
import { StaticAdPromptAnatomy } from './static-ad-prompt-anatomy'
import { useStaticAdStudio } from './static-ad-studio-provider'

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square', ratio: 1 },
  { id: '9:16', label: 'Story', ratio: 9 / 16 },
  { id: '16:9', label: 'Landscape', ratio: 16 / 9 },
  { id: '4:3', label: 'Classic', ratio: 4 / 3 },
] as const satisfies ReadonlyArray<{ id: StaticAdAspectRatio; label: string; ratio: number }>

const PROMPT_PLACEHOLDER =
  'Optional — pick a format preset below, or describe your Meta ad (UGC, unboxing, hook, CTA…)…'

function getSubmitShortcutLabel() {
  if (typeof navigator === 'undefined') return '⌘↵'
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? navigator.userAgent) ? '⌘↵' : 'Ctrl↵'
}

type StaticAdPromptComposerProps = {
  products: Product[]
  workspaceId: string
  model: Model | null
  productsTruncated?: boolean
}

function StaticAdPromptComposer({
  products,
  workspaceId,
  model,
  productsTruncated = false,
}: StaticAdPromptComposerProps) {
  const router = useRouter()
  const [submitShortcut] = useState(getSubmitShortcutLabel)
  const { textInput } = usePromptInputController()
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const { credits } = useWorkspaceBilling()
  const {
    composerRef,
    aspectRatio,
    setAspectRatio,
    productImages,
    setProductImages,
    language,
    setLanguage,
    registerPromptHandlers,
    clearActiveExample,
  } = useStaticAdStudio()

  const [isPending, startTransition] = useTransition()
  const [productOpen, setProductOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const productImage = productImages[0]
  const hasProductImage = Boolean(productImage)
  const modelCost = model?.cost ?? 0
  const hasEnoughCredits = !model || credits >= modelCost
  const canSubmit = hasProductImage && hasEnoughCredits && !isPending && Boolean(currentWorkspace?._id)

  const focusPrompt = useCallback(() => {
    textareaRef.current?.focus()
  }, [])

  const insertAtCursor = useCallback(
    (snippet: string) => {
      const el = textareaRef.current
      const current = textInput.value

      if (!el) {
        textInput.setInput(current ? `${current}${snippet}` : snippet)
        clearActiveExample()
        return
      }

      const start = el.selectionStart ?? current.length
      const end = el.selectionEnd ?? current.length
      const separator =
        current.length > 0 && start > 0 && !/\s$/.test(current.slice(0, start)) ? ', ' : ''
      const next = `${current.slice(0, start)}${separator}${snippet}${current.slice(end)}`
      textInput.setInput(next)
      clearActiveExample()

      requestAnimationFrame(() => {
        const position = start + separator.length + snippet.length
        el.focus()
        el.setSelectionRange(position, position)
      })
    },
    [clearActiveExample, textInput],
  )

  useEffect(() => {
    registerPromptHandlers({
      setPrompt: textInput.setInput,
      setAspectRatio,
      insertAtCursor,
      focusPrompt,
    })
  }, [focusPrompt, insertAtCursor, registerPromptHandlers, setAspectRatio, textInput.setInput])

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable

      if (event.key === '/' && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        focusPrompt()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [focusPrompt])

  const handleSubmit = (message: PromptInputMessage) => {
    const prompt = message.text.trim()
    const imageUrl = productImages[0]?.url

    if (!imageUrl) {
      toast.error('Add a product image to generate your ad.')
      return
    }

    if (!currentWorkspace?._id) {
      toast.error('Select a workspace to continue.')
      return
    }

    if (model && credits < model.cost) {
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
        language,
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
      <div className="rounded-2xl border border-border/60 bg-muted/20 px-6 py-10 text-center">
        <p className="text-[15px] font-medium text-foreground">GPT Image 2 is not configured</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Add openai/gpt-image-2 in the manager to start generating static ads.
        </p>
      </div>
    )
  }

  return (
    <div ref={composerRef} className="w-full scroll-mt-6">
      <PromptInput
        className={cn(
          'min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm',
          'transition-[border-color,box-shadow] duration-200',
          'has-[[data-slot=input-group-control]:focus-visible]:border-ring/50',
          'has-[[data-slot=input-group-control]:focus-visible]:shadow-md',
          'has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/15',
          '[box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.05)]',
        )}
        onSubmit={handleSubmit}
      >
        <div className="border-b border-border/45 px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">
                1. Product reference
                <span className="ml-1 text-destructive" aria-hidden>
                  *
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Required — used as the hero in your ad creative.
              </p>
            </div>
            <PromptInputButton
              type="button"
              disabled={isPending}
              onClick={() => setProductOpen(true)}
              className={cn(
                'h-8 shrink-0 gap-1.5 rounded-lg border px-2.5',
                'border-border/50 bg-background/90 shadow-xs',
                hasProductImage && 'border-foreground/15 bg-background text-foreground shadow-sm',
              )}
              tooltip={hasProductImage ? 'Change product image' : 'Select product image'}
            >
              {productImage ? (
                <span className="relative size-4 shrink-0 overflow-hidden rounded-[3px]">
                  <Image
                    alt={productImage.label ?? 'Selected product'}
                    className="object-cover"
                    fill
                    sizes="16px"
                    src={productImage.url}
                    unoptimized
                  />
                </span>
              ) : (
                <PackageIcon className="size-3.5 shrink-0 text-muted-foreground" />
              )}
              <span className="truncate text-xs font-medium">
                {productImage ? 'Change' : 'Add product'}
              </span>
            </PromptInputButton>
          </div>

          {productImage ? (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-border/50 bg-muted/15 p-2.5">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-border/50">
                <Image
                  alt={productImage.label ?? 'Product reference'}
                  className="object-cover"
                  fill
                  sizes="48px"
                  src={productImage.url}
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium tracking-[-0.01em] text-foreground">
                  {productImage.label ?? 'Product reference'}
                </p>
                <p className="text-[11px] text-muted-foreground">Ready to generate</p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setProductImages([])
                  clearActiveExample()
                }}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground active:scale-[0.97] disabled:opacity-50"
                aria-label="Remove product"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={() => setProductOpen(true)}
              className={cn(
                'mt-3 flex w-full items-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/10 px-3 py-3 text-left transition-colors',
                'hover:border-border hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                <ImagePlusIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-foreground">
                  Select a product photo
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  Choose from your catalog or upload a new image.
                </span>
              </span>
            </button>
          )}

          {!hasProductImage ? (
            <p
              className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground"
              role="status"
            >
              <AlertCircleIcon className="size-3 shrink-0" aria-hidden />
              Add a product image to enable Generate.
            </p>
          ) : null}

          {products.length === 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5">
              <p className="text-[11px] text-muted-foreground">No products in your catalog yet.</p>
              <AddProductTrigger workspaceId={workspaceId} label="Add product" variant="outline" />
            </div>
          ) : null}
        </div>

        <PromptInputBody className="relative min-w-0 border-b border-border/45">
          <div className="min-w-0 space-y-3 px-4 pt-4 sm:px-5">
            <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">
              2. Creative direction
              <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">(optional)</span>
            </p>
            <StaticAdFormatPresets />
          </div>
          <PromptInputTextarea
            ref={textareaRef}
            className={cn(
              'min-h-28 px-4 pt-2 pb-4 text-[15px] leading-[1.6] tracking-[-0.01em] sm:px-5',
              'bg-transparent placeholder:text-muted-foreground/55',
              'focus:outline-none focus:ring-0',
            )}
            disabled={isPending}
            placeholder={PROMPT_PLACEHOLDER}
            onChange={() => clearActiveExample()}
            onKeyDown={event => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && canSubmit) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
          />
        </PromptInputBody>

        <PromptInputFooter className="border-t border-border/45 px-3 py-2 sm:px-3.5 sm:py-2.5">
          <PromptInputTools className="min-w-0 flex-wrap gap-1.5">
            <span className="sr-only">3. Output settings</span>
            <div
              className="flex items-center gap-0.5 rounded-lg border border-border/35 bg-background/70 p-0.5 shadow-xs"
              role="group"
              aria-label="Aspect ratio"
            >
              {ASPECT_RATIOS.map(option => {
                const isSelected = aspectRatio === option.id

                return (
                  <PromptInputButton
                    key={option.id}
                    aria-label={`${option.label} (${option.id})`}
                    aria-pressed={isSelected}
                    className={cn(
                      'h-7 gap-1.5 rounded-md px-2 text-xs transition-[background-color,box-shadow,color] duration-150',
                      'active:scale-[0.97]',
                      isSelected
                        ? 'bg-background text-foreground shadow-xs ring-1 ring-border/50 hover:bg-background'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                    disabled={isPending}
                    onClick={() => setAspectRatio(option.id)}
                    tooltip={option.label}
                    type="button"
                  >
                    <AspectRatioIcon active={isSelected} ratio={option.ratio} />
                    <span className="max-[360px]:sr-only">{option.id}</span>
                  </PromptInputButton>
                )
              })}
            </div>

            <Separator className="hidden h-5 sm:block" orientation="vertical" />

            <div className="flex flex-col gap-0.5">
              <LanguageSelector value={language} onChange={setLanguage} disabled={isPending} />
              <span className="hidden text-[10px] text-muted-foreground sm:block">
                On-image text language
              </span>
            </div>
          </PromptInputTools>

          <div className="flex shrink-0 flex-col items-end gap-1">
            {!hasEnoughCredits ? (
              <Link
                href={DASHBOARD_ROUTES.UPGRADE}
                className="text-[11px] font-medium text-destructive hover:underline"
              >
                Insufficient credits — upgrade
              </Link>
            ) : (
              <span className="hidden text-[11px] tabular-nums text-muted-foreground/80 md:inline">
                {formatModelCost(model.cost, model.costUnit)}
              </span>
            )}
            <PromptInputSubmit
              className={cn(
                'h-8 gap-1.5 rounded-lg px-3.5 text-[13px] font-medium shadow-sm',
                'transition-[transform,opacity,box-shadow] duration-150 active:scale-[0.98]',
                !canSubmit && 'opacity-55',
              )}
              disabled={!canSubmit}
              size="sm"
              status={isPending ? 'submitted' : undefined}
            >
              <SparklesIcon className="size-3.5 shrink-0" />
              <span className="hidden sm:inline">Generate</span>
              <Kbd className="ml-0.5 hidden h-5 min-w-5 border-primary-foreground/15 bg-primary-foreground/10 px-1 text-[10px] font-normal text-primary-foreground/85 lg:inline-flex">
                {submitShortcut}
              </Kbd>
            </PromptInputSubmit>
          </div>
        </PromptInputFooter>
      </PromptInput>

      <div className="mt-2.5 space-y-2.5">
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-muted-foreground/75">
          <span>Press</span>
          <Kbd className="h-4 min-w-4 px-1 text-[10px]">/</Kbd>
          <span>to focus</span>
          <span aria-hidden className="text-muted-foreground/35">
            ·
          </span>
          <span>Press</span>
          <Kbd className="h-4 min-w-4 px-1 text-[10px]">{submitShortcut}</Kbd>
          <span>to generate</span>
        </p>
        <StaticAdPromptAnatomy />
      </div>

      <ProductPickerDialog
        open={productOpen}
        onOpenChange={setProductOpen}
        products={products}
        productsTruncated={productsTruncated}
        workspaceId={workspaceId}
        selected={productImages}
        onConfirm={images => {
          setProductImages(images)
          clearActiveExample()
        }}
      />
    </div>
  )
}

export function StaticAdPromptInput({
  products,
  workspaceId,
  model,
  productsTruncated,
}: {
  products: Product[]
  workspaceId: string
  model: Model | null
  productsTruncated?: boolean
}) {
  return (
    <PromptInputProvider>
      <StaticAdPromptComposer
        model={model}
        products={products}
        productsTruncated={productsTruncated}
        workspaceId={workspaceId}
      />
    </PromptInputProvider>
  )
}
