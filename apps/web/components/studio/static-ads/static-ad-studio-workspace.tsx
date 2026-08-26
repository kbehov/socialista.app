'use client'

import { StudioHero } from '@/components/studio/images/studio-hero'
import { StaticAdPromptInput } from './static-ad-prompt-input'
import { StaticAdStudioProvider, useStaticAdStudio } from './static-ad-studio-provider'
import { StaticAdTemplatesGallery } from './templates/static-ad-templates-gallery'
import { DashboardSegment, DashboardSegmentButton } from '@/components/dashboard'
import type { Model } from '@socialista/types'

type StaticAdStudioWorkspaceProps = {
  workspaceId: string
  model: Model | null
}

function StaticAdStudioBody({ workspaceId, model }: StaticAdStudioWorkspaceProps) {
  const { studioView, setStudioView } = useStaticAdStudio()

  return (
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

      <div className="relative z-20 mx-auto -mt-5 flex w-full max-w-5xl justify-center px-4 sm:px-6 lg:px-8">
        <DashboardSegment label="Static ad studio">
          <DashboardSegmentButton active={studioView === 'compose'} onClick={() => setStudioView('compose')}>
            Create
          </DashboardSegmentButton>
          <DashboardSegmentButton active={studioView === 'templates'} onClick={() => setStudioView('templates')}>
            Templates
          </DashboardSegmentButton>
        </DashboardSegment>
      </div>

      <div className={studioView === 'compose' ? 'contents' : 'hidden'}>
        <section
          id="static-ad-studio-composer"
          aria-label="Create a static ad"
          className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-4 pt-5 pb-[max(7rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] sm:px-6 lg:px-8"
        >
          <div className="image-studio-composer relative">
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

      <div className={studioView === 'templates' ? 'contents' : 'hidden'}>
        <section
          aria-label="Browse static ad templates"
          className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 pb-[max(7rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] sm:px-6 lg:px-8"
        >
          <StaticAdTemplatesGallery />
        </section>
      </div>
    </div>
  )
}

export function StaticAdStudioWorkspace({ workspaceId, model }: StaticAdStudioWorkspaceProps) {
  return (
    <StaticAdStudioProvider>
      <StaticAdStudioBody model={model} workspaceId={workspaceId} />
    </StaticAdStudioProvider>
  )
}
