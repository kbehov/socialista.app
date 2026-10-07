'use client'

import { imageStudioHomeRootClassName } from '@/components/dashboard/studio-shell'
import { StaticAdFormatPresets } from '@/components/studio/static-ads/static-ad-format-presets'
import { StudioHomeBelowSection } from '@/components/studio/studio-home-below-section'
import { StudioHomeComposerSection } from '@/components/studio/studio-home-composer-section'
import { StudioHomePromptExtras } from '@/components/studio/studio-home-prompt-extras'
import { StaticAdPromptInput } from './static-ad-prompt-input'
import { StaticAdStudioProvider } from './static-ad-studio-provider'
import { StaticAdTemplatesGallery } from './templates/static-ad-templates-gallery'
import type { Model } from '@socialista/types'

type StaticAdStudioWorkspaceProps = {
  workspaceId: string
  models: Model[]
}

function StaticAdStudioBody({ workspaceId, models }: StaticAdStudioWorkspaceProps) {
  return (
    <div className={imageStudioHomeRootClassName}>
      <StudioHomeComposerSection
        id="static-ad-studio-composer"
        ariaLabel="Create a static ad"
        contentMaxWidth="wide"
        description="Describe the product and layout — tag references with @image1 for on-brand creatives."
        footer={<StudioHomePromptExtras />}
      >
        <div className="flex w-full flex-col gap-4">
          <StaticAdFormatPresets compact />
          <StaticAdPromptInput models={models} workspaceId={workspaceId} />
        </div>
      </StudioHomeComposerSection>

      <StudioHomeBelowSection ariaLabel="Templates" className="pb-10 sm:pb-12">
        <StaticAdTemplatesGallery embedded models={models} workspaceId={workspaceId} />
      </StudioHomeBelowSection>
    </div>
  )
}

export function StaticAdStudioWorkspace({ workspaceId, models }: StaticAdStudioWorkspaceProps) {
  return (
    <StaticAdStudioProvider>
      <StaticAdStudioBody models={models} workspaceId={workspaceId} />
    </StaticAdStudioProvider>
  )
}
