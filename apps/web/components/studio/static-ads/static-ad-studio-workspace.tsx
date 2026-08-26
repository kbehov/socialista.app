'use client'

import { StaticAdStudioHero } from './static-ad-studio-hero'
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
    <div className="image-studio image-studio-workspace relative flex w-full flex-col">
      <StaticAdStudioHero />

      <section
        id="static-ad-studio-composer"
        aria-label="Create a static ad"
        className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-4 pt-5 sm:px-6 sm:pt-6 lg:px-8"
      >
        <StaticAdPromptInput models={models} workspaceId={workspaceId} />
      </section>

      <section
        aria-label="Browse static ad templates"
        className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-10 pb-[max(7rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] sm:px-6 sm:pt-12 lg:px-8"
      >
        <StaticAdTemplatesGallery />
      </section>
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
