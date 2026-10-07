'use client'

import type { AttachedMedia } from '@/components/files/attach-media/types'
import { StudioTemplatePreviewMedia } from '@/components/studio/templates/studio-template-preview-media'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import type { StudioTemplateRecreateIdea } from '@/lib/studio/template-recreate'
import { templateToRecreateAttachments } from '@/lib/studio/template-media'
import { cn } from '@/lib/utils'
import type { StudioTemplateDto } from '@socialista/types'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type StudioTemplateRecreateOverride = {
  id: string
  previewUrl: string
  attachments: AttachedMedia[]
  initialPrompt: string
}

type StudioTemplateRecreateState = {
  template: StudioTemplateDto | null
  previewUrl: string
  prompt: string
  attachments: AttachedMedia[]
}

type StudioTemplateRecreateContextValue = {
  state: StudioTemplateRecreateState
  actions: {
    setPrompt: (prompt: string) => void
  }
}

const StudioTemplateRecreateContext = createContext<StudioTemplateRecreateContextValue | null>(null)

export function useStudioTemplateRecreate() {
  const value = useContext(StudioTemplateRecreateContext)
  if (!value) {
    throw new Error('useStudioTemplateRecreate must be used within StudioTemplateRecreateDialog')
  }
  return value
}

type StudioTemplateRecreateDialogProps = {
  template: StudioTemplateDto | null
  recreateOverride?: StudioTemplateRecreateOverride | null
  open: boolean
  onOpenChange: (open: boolean) => void
  ideas: readonly StudioTemplateRecreateIdea[]
  resolveInitialPrompt: (template: StudioTemplateDto) => string
  title: string
  description: string
  contextLabel?: string
  canGoPrevious?: boolean
  canGoNext?: boolean
  onGoPrevious?: () => void
  onGoNext?: () => void
  children: ReactNode
  sessionClassName?: string
  previewMediaClassName?: string
  scrollAreaClassName?: string
}

const RECREATE_PREVIEW_MEDIA_CLASS =
  'max-h-[min(58vh,640px)] w-auto max-w-full rounded-xl object-contain shadow-[0_24px_64px_-24px_rgba(0,0,0,0.65)] outline outline-1 outline-white/10'

function RecreateIdeas({
  ideas,
  prompt,
  onSelect,
}: {
  ideas: readonly StudioTemplateRecreateIdea[]
  prompt: string
  onSelect: (prompt: string) => void
}) {
  return (
    <div className="absolute bottom-3 left-3 flex max-w-[min(100%,18rem)] flex-col items-start gap-1.5">
      <Collapsible defaultOpen>
        <CollapsibleTrigger
          type="button"
          className={cn(
            'group inline-flex h-7 items-center gap-1 rounded-full px-2.5',
            'bg-black/55 text-[11px] font-medium tracking-[-0.01em] text-white backdrop-blur-sm',
            'transition-[background-color,transform] duration-150',
            'hover:bg-black/70',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/45',
            'active:scale-[0.96] motion-reduce:active:scale-100',
          )}
        >
          Try these ideas
          <ChevronDownIcon className="size-3 shrink-0 opacity-80 transition-transform duration-150 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-150">
          <div className="mt-1.5 flex flex-col items-start gap-1.5">
            {ideas.map((idea, index) => {
              const active = prompt === idea.prompt

              return (
                <button
                  key={idea.id}
                  type="button"
                  onClick={() => onSelect(idea.prompt)}
                  style={{ animationDelay: `${index * 40}ms` }}
                  className={cn(
                    'inline-flex h-7 items-center rounded-full px-2.5',
                    'text-[12px] font-medium tracking-[-0.015em]',
                    'transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
                    'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200',
                    'motion-safe:[animation-fill-mode:backwards] motion-reduce:animate-none',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/45',
                    'active:scale-[0.96] motion-reduce:active:scale-100',
                    active
                      ? 'bg-zinc-900 text-white'
                      : 'bg-white/95 text-zinc-800 shadow-sm hover:bg-white',
                  )}
                >
                  {idea.label}
                </button>
              )
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function RecreateSession({
  template,
  recreateOverride,
  ideas,
  resolveInitialPrompt,
  contextLabel,
  sessionClassName,
  previewMediaClassName,
  children,
}: {
  template: StudioTemplateDto | null
  recreateOverride?: StudioTemplateRecreateOverride
  ideas: readonly StudioTemplateRecreateIdea[]
  resolveInitialPrompt: (template: StudioTemplateDto) => string
  contextLabel?: string
  sessionClassName?: string
  previewMediaClassName?: string
  children: ReactNode
}) {
  const previewUrl = recreateOverride?.previewUrl ?? template?.previewImageUrl ?? ''
  const attachments = useMemo(
    () => recreateOverride?.attachments ?? (template ? templateToRecreateAttachments(template) : []),
    [recreateOverride, template],
  )
  const [prompt, setPrompt] = useState(() =>
    recreateOverride?.initialPrompt ?? (template ? resolveInitialPrompt(template) : ''),
  )
  const value = useMemo(
    () => ({
      state: { template, previewUrl, prompt, attachments },
      actions: { setPrompt },
    }),
    [attachments, previewUrl, prompt, template],
  )

  return (
    <StudioTemplateRecreateContext.Provider value={value}>
      <div
        className={cn(
          'pointer-events-auto flex w-full flex-col items-center',
          sessionClassName ?? 'max-w-[min(92vw,32rem)]',
        )}
      >
        <div className="relative w-fit max-w-full">
          <StudioTemplatePreviewMedia
            url={previewUrl}
            alt=""
            autoPlay
            className={previewMediaClassName ?? RECREATE_PREVIEW_MEDIA_CLASS}
          />
          <RecreateIdeas ideas={ideas} prompt={prompt} onSelect={setPrompt} />
        </div>
        {contextLabel ? (
          <p className="mt-3 max-w-full truncate text-center text-[13px] font-medium tracking-[-0.015em] text-white/78">
            {contextLabel}
          </p>
        ) : null}
        <div className={cn('w-full', contextLabel ? 'mt-2.5' : 'mt-3')}>{children}</div>
      </div>
    </StudioTemplateRecreateContext.Provider>
  )
}

export function StudioTemplateRecreateDialog({
  template,
  recreateOverride,
  open,
  onOpenChange,
  ideas,
  resolveInitialPrompt,
  title,
  description,
  contextLabel,
  canGoPrevious = false,
  canGoNext = false,
  onGoPrevious,
  onGoNext,
  children,
  sessionClassName,
  previewMediaClassName,
  scrollAreaClassName,
}: StudioTemplateRecreateDialogProps) {
  const canNavigate = Boolean(onGoPrevious || onGoNext)
  const sessionKey = recreateOverride?.id ?? template?._id
  const hasSession = Boolean(open && sessionKey && (recreateOverride || template))

  useEffect(() => {
    if (!open || !canNavigate) return

    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLElement) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return
      }
      if (event.key === 'ArrowLeft' && canGoPrevious) {
        event.preventDefault()
        onGoPrevious?.()
      }
      if (event.key === 'ArrowRight' && canGoNext) {
        event.preventDefault()
        onGoNext?.()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canGoNext, canGoPrevious, canNavigate, onGoNext, onGoPrevious, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-2xl backdrop-saturate-150 supports-backdrop-filter:bg-black/45"
        className={cn(
          'pointer-events-none inset-0 top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col',
          'gap-0 overflow-hidden rounded-none border-0 bg-transparent p-0 shadow-none sm:max-w-none sm:rounded-none',
          'data-open:zoom-in-100 data-closed:zoom-out-100',
        )}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>

        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className={cn(
            'pointer-events-auto absolute top-4 right-4 z-10 size-9 rounded-full',
            'bg-white/10 text-white hover:bg-white/16 hover:text-white',
            'active:scale-[0.96] motion-reduce:active:scale-100',
          )}
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <XIcon className="size-4" strokeWidth={1.75} />
        </Button>

        {canNavigate ? (
          <>
            <button
              type="button"
              aria-label="Previous template"
              disabled={!canGoPrevious}
              onClick={onGoPrevious}
              className={cn(
                'pointer-events-auto absolute top-1/2 left-3 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full sm:left-5',
                'bg-white/10 text-white',
                'transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
                'hover:bg-white/16',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                'active:scale-[0.96] motion-reduce:active:scale-100',
                'disabled:pointer-events-none disabled:opacity-30',
              )}
            >
              <ChevronLeftIcon className="size-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label="Next template"
              disabled={!canGoNext}
              onClick={onGoNext}
              className={cn(
                'pointer-events-auto absolute top-1/2 right-3 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full sm:right-5',
                'bg-white/10 text-white',
                'transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
                'hover:bg-white/16',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                'active:scale-[0.96] motion-reduce:active:scale-100',
                'disabled:pointer-events-none disabled:opacity-30',
              )}
            >
              <ChevronRightIcon className="size-5" strokeWidth={1.75} />
            </button>
          </>
        ) : null}

        <div
          className={cn(
            'flex min-h-0 flex-1 justify-center overflow-y-auto overscroll-contain px-4 py-10 sm:py-14',
            scrollAreaClassName ?? 'items-center',
          )}
        >
          {hasSession ? (
            <RecreateSession
              key={sessionKey}
              template={recreateOverride ? null : template}
              recreateOverride={recreateOverride ?? undefined}
              ideas={ideas}
              resolveInitialPrompt={resolveInitialPrompt}
              contextLabel={contextLabel}
              sessionClassName={sessionClassName}
              previewMediaClassName={previewMediaClassName}
            >
              {children}
            </RecreateSession>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
