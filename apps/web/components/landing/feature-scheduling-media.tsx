'use client'

import dynamic from 'next/dynamic'

import { landingWorkflowPanelDark } from './landing-classes'

/** Calendar reads `new Date()`. Skip SSR so the week label cannot mismatch hydration. */
const WorkflowSchedulingMockup = dynamic(
  () => import('./landing-workflow-scheduling-mockup').then(mod => mod.WorkflowSchedulingMockup),
  { ssr: false },
)

export function SchedulingFeatureMedia() {
  return (
    <div className={landingWorkflowPanelDark}>
      <WorkflowSchedulingMockup />
    </div>
  )
}
