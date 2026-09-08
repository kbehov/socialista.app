'use client'

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning'
import { Shimmer } from '@/components/ai-elements/shimmer'
import { cn } from '@/lib/utils'
import { CheckIcon, Loader2Icon } from 'lucide-react'

const STILL_STEPS = [
  { id: 'prepare', label: 'Reading the scene brief', threshold: 0 },
  { id: 'enhance', label: 'Shaping the photo prompt', threshold: 15 },
  { id: 'generate', label: 'Generating stills', threshold: 40 },
  { id: 'finalize', label: 'Saving photos', threshold: 85 },
] as const

const VIDEO_STEPS = [
  { id: 'prepare', label: 'Preparing the start frame', threshold: 0 },
  { id: 'motion', label: 'Rendering motion', threshold: 25 },
  { id: 'finalize', label: 'Saving the clip', threshold: 85 },
] as const

const AUDIO_STEPS = [
  { id: 'prepare', label: 'Preparing the script', threshold: 0 },
  { id: 'voice', label: 'Generating voiceover', threshold: 20 },
  { id: 'finalize', label: 'Saving audio', threshold: 85 },
] as const

type UgcGenerationStatusProps = {
  kind: 'still' | 'video' | 'audio'
  generating: boolean
  progress?: number
  progressLabel?: string
  className?: string
}

function stepState(
  progress: number,
  threshold: number,
  nextThreshold: number | undefined,
  generating: boolean,
): 'complete' | 'active' | 'pending' {
  if (!generating && progress >= 100) return 'complete'
  if (progress >= (nextThreshold ?? 100)) return 'complete'
  if (progress >= threshold) return 'active'
  return 'pending'
}

export function UgcGenerationStatus({
  kind,
  generating,
  progress = 0,
  progressLabel,
  className,
}: UgcGenerationStatusProps) {
  if (!generating && progress < 5) return null

  const steps = kind === 'still' ? STILL_STEPS : kind === 'video' ? VIDEO_STEPS : AUDIO_STEPS
  const title =
    kind === 'still' ? 'Generating photos' : kind === 'video' ? 'Rendering video' : 'Generating voiceover'
  const reasoningText =
    progressLabel?.trim() ||
    (kind === 'still'
      ? 'Planning framing, lighting, and product placement.'
      : kind === 'video'
        ? 'Animating the selected still into a short clip.'
        : 'Turning the script into a spoken take.')

  return (
    <div className={cn('overflow-hidden rounded-xl bg-muted/40 px-3.5 py-3', className)}>
      <Reasoning isStreaming={generating} defaultOpen={generating} className="mb-0">
        <ReasoningTrigger
          getThinkingMessage={(streaming, duration) => {
            if (streaming) {
              return (
                <span className="flex items-center gap-2">
                  <Shimmer duration={1}>{progressLabel ?? title}</Shimmer>
                  {progress > 0 ? (
                    <span className="tabular-nums text-muted-foreground">{Math.round(progress)}%</span>
                  ) : null}
                </span>
              )
            }
            if (duration === undefined) return <p>Finished in a few seconds</p>
            return <p>Finished in {duration}s</p>
          }}
        />
        <ReasoningContent className="mt-1.5 text-[12px] text-muted-foreground">{reasoningText}</ReasoningContent>
      </Reasoning>

      {progress > 0 ? (
        <div className="mt-2.5 h-px overflow-hidden bg-border/70">
          <div
            className="h-full bg-foreground/50 transition-[width] duration-300"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      ) : null}

      <ol className="mt-2.5 space-y-1">
        {steps.map((step, index) => {
          const next = steps[index + 1]
          const state = stepState(progress, step.threshold, next?.threshold, generating)
          return (
            <li
              key={step.id}
              className={cn(
                'flex items-center gap-2 text-[12px]',
                state === 'pending' && 'text-muted-foreground/50',
                state === 'active' && 'text-foreground',
                state === 'complete' && 'text-muted-foreground',
              )}
            >
              {state === 'complete' ? (
                <CheckIcon className="size-3 shrink-0" strokeWidth={2.5} />
              ) : state === 'active' ? (
                <Loader2Icon className="size-3 shrink-0 animate-spin" />
              ) : (
                <span className="size-3 shrink-0 rounded-full border border-border" />
              )}
              <span>{step.label}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
