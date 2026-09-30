import {
  ANALYTICS_SECTION,
  PUBLISH_SECTION,
  SCHEDULING_SECTION,
} from './content'
import { LANDING_STORY_INDEX } from './landing-classes'
import { LandingWorkflowSection } from './landing-workflow-section'
import {
  WorkflowAnalyticsMockup,
  WorkflowPublishMockup,
  WorkflowSchedulingMockup,
} from './landing-workflow-mockups'

export function LandingPublish() {
  return (
    <LandingWorkflowSection
      id="publish"
      storyIndex={LANDING_STORY_INDEX.publish}
      content={PUBLISH_SECTION}
      mockup={<WorkflowPublishMockup />}
    />
  )
}

export function LandingScheduling() {
  return (
    <LandingWorkflowSection
      id="scheduling"
      storyIndex={LANDING_STORY_INDEX.scheduling}
      content={SCHEDULING_SECTION}
      mockup={<WorkflowSchedulingMockup />}
      reverse
      sectionTone="dark"
      panelTone="dark"
    />
  )
}

export function LandingAnalytics() {
  return (
    <LandingWorkflowSection
      id="analytics"
      storyIndex={LANDING_STORY_INDEX.analytics}
      content={ANALYTICS_SECTION}
      mockup={<WorkflowAnalyticsMockup />}
    />
  )
}
