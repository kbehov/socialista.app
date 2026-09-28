'use client'

import { PipelineStep } from '@/components/studio/generation/pipeline-step'
import { PIPELINE_STEPS } from '@/constants/generation.const'
import { pipelineStepState } from '@/lib/image-generation/run-utils'
import type { RefObject } from 'react'

type GenerationPipelineSectionProps = {
  activeStepIndex: number
  activeStepRef: RefObject<HTMLDivElement | null>
  headingId: string
  progress: number
  statusLabel: string
}

export function GenerationPipelineSection({
  activeStepIndex,
  activeStepRef,
  headingId,
  progress,
  statusLabel,
}: GenerationPipelineSectionProps) {
  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3
          id={headingId}
          className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40 dark:text-white/40"
        >
          Progress
        </h3>
        <span className="text-[11px] tabular-nums tracking-[-0.006em] text-black/40 dark:text-white/40">
          {Math.round(Math.min(progress, 100))}%
        </span>
      </div>

      <div>
        {PIPELINE_STEPS.map((step, index) => {
          const nextThreshold = PIPELINE_STEPS[index + 1]?.threshold
          const state = pipelineStepState(progress, step.threshold, nextThreshold, false)
          const isActive = index === activeStepIndex

          return (
            <PipelineStep
              key={step.id}
              detail={isActive ? statusLabel : undefined}
              isLast={index === PIPELINE_STEPS.length - 1}
              label={step.label}
              state={state}
              stepRef={isActive ? activeStepRef : undefined}
            />
          )
        })}
      </div>
    </section>
  )
}
