'use client'

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from '@/components/ai-elements/chain-of-thought'
import { Shimmer } from '@/components/ai-elements/shimmer'
import { Skeleton } from '@/components/ui/skeleton'
import { UGC_PLAN_STEPS, ugcPlanStepStatus } from '@/utils/ugc/plan.utils'
import { useEffect, useState } from 'react'

export function UgcPlanProgress() {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStepIndex(1), 4000),
      window.setTimeout(() => setStepIndex(2), 12000),
    ]
    return () => {
      for (const timer of timers) window.clearTimeout(timer)
    }
  }, [])

  return (
    <div className="space-y-5">
      <Shimmer className="text-[13px]" duration={1.4}>
        Planning your video…
      </Shimmer>
      <ChainOfThought defaultOpen>
        <ChainOfThoughtHeader>Working</ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          {UGC_PLAN_STEPS.map((step, index) => (
            <ChainOfThoughtStep
              key={step.label}
              label={step.label}
              description={step.description}
              status={ugcPlanStepStatus(index, stepIndex, false)}
            />
          ))}
        </ChainOfThoughtContent>
      </ChainOfThought>
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-2 rounded-xl border border-border/60 p-3.5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
