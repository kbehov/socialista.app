import { PIPELINE_STEPS } from '@/constants/generation.const'
import { pipelineStepState } from '@/lib/image-generation/run-utils'
import type { RefObject } from 'react'
import { PipelineStep } from './pipeline-step'

type PipelineStepsSectionProps = {
  headingId: string
  activeStepIndex: number
  statusLabel: string
  progress: number
  activeStepRef: RefObject<HTMLDivElement | null>
}

export function PipelineStepsSection({
  headingId,
  activeStepIndex,
  statusLabel,
  progress,
  activeStepRef,
}: PipelineStepsSectionProps) {
  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <h3 id={headingId} className="text-[12px] font-medium tracking-[-0.015em] text-black/56 dark:text-white/56">
        Progress
      </h3>

      <div className="rounded-xl border border-black/10 bg-black/[0.02] p-3.5 dark:border-white/12 dark:bg-white/[0.02]">
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
