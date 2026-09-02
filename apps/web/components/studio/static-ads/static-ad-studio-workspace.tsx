'use client'

import { StaticAdPromptInput } from './static-ad-prompt-input'
import { StaticAdStudioHero } from './static-ad-studio-hero'
import { StaticAdStudioProvider } from './static-ad-studio-provider'
import { StaticAdTemplatesGallery } from './templates/static-ad-templates-gallery'
import type { Model } from '@socialista/types'

type StaticAdStudioWorkspaceProps = {
  workspaceId: string
  models: Model[]
}

function StaticAdStudioBody({ workspaceId, models }: StaticAdStudioWorkspaceProps) {
  return (
    <div className="image-studio image-studio-workspace image-studio-home relative flex w-full flex-1 flex-col">
      <StaticAdStudioHero />

      <section
        id="static-ad-studio-composer"
        aria-label="Create a static ad"
        className="relative z-10 mx-auto flex w-full max-w-[48rem] flex-col px-4 pb-6 sm:px-6 lg:px-8 -mt-7 sm:-mt-8"
      >
        <StaticAdPromptInput models={models} workspaceId={workspaceId} />
      </section>

      <section
        aria-label="Browse static ad templates"
        className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-[max(4rem,calc(env(safe-area-inset-bottom,0px)+3rem))] sm:px-6 lg:px-8"
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
