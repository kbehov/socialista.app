'use client'

import { StudioHero } from '@/components/studio/images/studio-hero'
import type { Model } from '@socialista/types'
import { StaticAdPromptInput } from './static-ad-prompt-input'
import { StaticAdStudioProvider } from './static-ad-studio-provider'

type StaticAdStudioWorkspaceProps = {
  workspaceId: string
  model: Model | null
}

export function StaticAdStudioWorkspace({ workspaceId, model }: StaticAdStudioWorkspaceProps) {
  return (
    <StaticAdStudioProvider>
      <div className="image-studio image-studio-workspace relative flex w-full flex-col">
        <StudioHero
          imageSrc="/socialista-static-ads.webp"
          chipLabel="Static ads"
          title={'Ads\nin seconds.'}
          description="One product photo. Scroll-stopping creatives — ready to run."
          imagePosition="object-[50%_42%]"
          overlayVariant="strong"
          blurBackground
        />

        <section
          id="static-ad-studio-composer"
          aria-label="Create a static ad"
          className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-4 pb-[max(7rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] sm:px-6 lg:px-8"
        >
          <div className="image-studio-composer relative -mt-[3.25rem] sm:-mt-[4.25rem] lg:-mt-[4.5rem]">
            <div
              aria-hidden
              className="image-studio-composer-lift pointer-events-none absolute -inset-x-3 -top-5 bottom-6 sm:-inset-x-5 motion-reduce:hidden"
            />
            <div className="relative">
              <StaticAdPromptInput model={model} workspaceId={workspaceId} />
            </div>
          </div>
        </section>
      </div>
    </StaticAdStudioProvider>
  )
}
