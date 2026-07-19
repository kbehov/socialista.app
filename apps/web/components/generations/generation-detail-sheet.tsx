'use client'

import { GenerationStatusBadge } from '@/components/generations/generation-status-badge'
import {
  formatAbsoluteDate,
  GENERATION_KIND_LABELS,
  getGenerationTitle,
} from '@/components/generations/generation-meta'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { formatCost, formatDuration, formatRelativeTime } from '@/utils/format'
import type { Generation } from '@socialista/types'
import { ExternalLinkIcon, ImageIcon, VideoIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type GenerationDetailSheetProps = {
  generation: Generation | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[120px_1fr] sm:gap-3">
      <dt className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="min-w-0 text-sm text-foreground">{children}</dd>
    </div>
  )
}

function PromptBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="rounded-lg border border-border/70 bg-muted/30 p-3 text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground">
        {value}
      </p>
    </div>
  )
}

function ResultPreview({ generation }: { generation: Generation }) {
  const result = generation.result
  if (!result?.url) {
    return (
      <div className="flex aspect-square max-h-64 w-full items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 text-muted-foreground">
        <div className="flex flex-col items-center gap-2 text-center">
          <ImageIcon className="size-6 opacity-60" strokeWidth={1.5} />
          <p className="text-xs">No result yet</p>
        </div>
      </div>
    )
  }

  if (result.type === 'video') {
    return (
      <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/20">
        <video src={result.url} controls className="max-h-72 w-full bg-black object-contain" />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/20">
      {/* eslint-disable-next-line @next/next/no-img-element -- remote generation URLs vary by provider */}
      <img src={result.url} alt="" className="max-h-72 w-full object-contain" />
    </div>
  )
}

export function GenerationDetailSheet({
  generation,
  open,
  onOpenChange,
}: GenerationDetailSheetProps) {
  const title = generation
    ? getGenerationTitle(generation.prompt, generation.kind)
    : 'Generation'
  const kindLabel = generation ? GENERATION_KIND_LABELS[generation.kind] : ''
  const modelLabel = generation?.modelName ?? generation?.model ?? '—'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border/60 px-5 py-4 text-left">
          <SheetTitle className="line-clamp-2 pr-8 text-base tracking-tight">{title}</SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-2 pt-1">
            {generation ? (
              <>
                <Badge variant="secondary" className="font-medium">
                  {kindLabel}
                </Badge>
                <GenerationStatusBadge status={generation.status} />
              </>
            ) : null}
          </SheetDescription>
        </SheetHeader>

        {generation ? (
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-6 px-5 py-5">
              <ResultPreview generation={generation} />

              {generation.result?.url ? (
                <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                  <a href={generation.result.url} target="_blank" rel="noreferrer">
                    {generation.result.type === 'video' ? (
                      <VideoIcon className="size-3.5" strokeWidth={1.75} />
                    ) : (
                      <ExternalLinkIcon className="size-3.5" strokeWidth={1.75} />
                    )}
                    Open result
                  </a>
                </Button>
              ) : null}

              <dl className="space-y-4">
                <DetailRow label="Model">{modelLabel}</DetailRow>
                <DetailRow label="Cost">
                  {formatCost(generation.creditsCharged || generation.cost)}
                </DetailRow>
                <DetailRow label="Runtime">
                  {formatDuration(generation.durationMs)}
                </DetailRow>
                <DetailRow label="Started">
                  <span className="tabular-nums">
                    {formatAbsoluteDate(generation.startedAt)}
                    <span className="text-muted-foreground">
                      {' '}
                      ({formatRelativeTime(generation.startedAt)})
                    </span>
                  </span>
                </DetailRow>
                {generation.finishedAt ? (
                  <DetailRow label="Finished">
                    <span className="tabular-nums">
                      {formatAbsoluteDate(generation.finishedAt)}
                    </span>
                  </DetailRow>
                ) : null}
                {generation.inputs?.aspectRatio ? (
                  <DetailRow label="Aspect">{generation.inputs.aspectRatio}</DetailRow>
                ) : null}
              </dl>

              {generation.errorMessage ? (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                  <p className="text-[11px] font-semibold tracking-wide text-destructive uppercase">
                    Error
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-destructive">
                    {generation.errorMessage}
                  </p>
                </div>
              ) : null}

              {generation.prompt ? (
                <PromptBlock label="Prompt" value={generation.prompt} />
              ) : null}

              {generation.enhancedPrompt ? (
                <PromptBlock label="Enhanced prompt" value={generation.enhancedPrompt} />
              ) : null}
            </div>
          </ScrollArea>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
