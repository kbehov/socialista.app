'use client'

import { ImagePromptInput } from '@/components/studio/images/prompt-input'
import { STUDIO_HERO_COMPOSER_SURFACE_CLASS } from '@/components/studio/prompt/studio-composer-surface'
import { StudioTemplatePreviewMedia } from '@/components/studio/templates/studio-template-preview-media'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { IMAGE_TEMPLATE_RECREATE_IDEAS, templateRecreatePrompt } from '@/lib/studio/image-recreate'
import { templateToRecreateAttachments } from '@/lib/studio/template-media'
import { cn } from '@/lib/utils'
import {
  StudioTemplateKind,
  type Model,
  type StudioTemplateDto,
} from '@socialista/types'
import { ChevronDownIcon, XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

type ImageTemplateRecreateDialogProps = {
  template: StudioTemplateDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  models: Model[]
}

function RecreateComposer({
  template,
  models,
}: {
  template: StudioTemplateDto
  models: Model[]
}) {
  const [prompt, setPrompt] = useState(() => templateRecreatePrompt(template))
  const attachments = useMemo(() => templateToRecreateAttachments(template), [template])
  const payload = template.kind === StudioTemplateKind.IMAGE ? template.payload : undefined

  return (
    <div className="pointer-events-auto flex w-full max-w-[min(92vw,32rem)] flex-col items-center">
      <div className="relative w-fit max-w-full">
        <StudioTemplatePreviewMedia
          url={template.previewImageUrl}
          alt=""
          className="max-h-[min(58vh,640px)] w-auto max-w-full rounded-xl object-contain shadow-[0_24px_64px_-24px_rgba(0,0,0,0.65)] outline outline-1 outline-white/10"
        />

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
                'active:scale-[0.97] motion-reduce:active:scale-100',
              )}
            >
              Try these ideas
              <ChevronDownIcon className="size-3 shrink-0 opacity-80 transition-transform duration-150 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-150">
              <div className="mt-1.5 flex flex-col items-start gap-1.5">
                {IMAGE_TEMPLATE_RECREATE_IDEAS.map(idea => {
                  const active = prompt === idea.prompt

                  return (
                    <button
                      key={idea.id}
                      type="button"
                      onClick={() => setPrompt(idea.prompt)}
                      className={cn(
                        'inline-flex h-7 items-center rounded-full px-2.5',
                        'text-[12px] font-medium tracking-[-0.015em]',
                        'transition-[background-color,color,transform] duration-150',
                        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/45',
                        'active:scale-[0.97] motion-reduce:active:scale-100',
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
      </div>

      <div className="mt-3 w-full">
        <ImagePromptInput
          models={models}
          hideExtras
          bindStudio={false}
          autoFocus
          initialPrompt={prompt}
          initialAttachments={attachments}
          initialAspectRatio={payload?.aspectRatio}
          initialModel={payload?.model}
          placeholder="Describe how to recreate this image…"
          surfaceClassName={STUDIO_HERO_COMPOSER_SURFACE_CLASS}
        />
      </div>
    </div>
  )
}

export function ImageTemplateRecreateDialog({
  template,
  open,
  onOpenChange,
  models,
}: ImageTemplateRecreateDialogProps) {
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
        <DialogTitle className="sr-only">Recreate image</DialogTitle>
        <DialogDescription className="sr-only">
          Recreate this template. The reference image is already attached.
        </DialogDescription>

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

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-16">
          {open && template ? (
            <RecreateComposer key={template._id} template={template} models={models} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
