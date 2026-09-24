'use client'

import { SlideshowList } from '@/components/carousel/slideshow-list'
import { SlideshowPromptComposer } from '@/components/carousel/slideshow-prompt-composer'
import { StudioHomeCreateButton } from '@/components/studio/studio-home-hero-actions'
import { SlideshowPresetRow } from '@/components/studio/slideshows/slideshow-preset-row'
import { SlideshowStudioProvider } from '@/components/studio/slideshows/slideshow-studio-provider'
import { SlideshowTemplatesGallery } from '@/components/studio/slideshows/slideshow-templates-gallery'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { Model, Preset, SlideshowSummaryResponse } from '@socialista/types'
import Image from 'next/image'

const STAGE_IMAGE_SIZES = '(max-width: 768px) 100vw, 1200px'

type SlideshowStudioWorkspaceProps = {
  models: Model[]
  textModels: Model[]
  presets: Preset[]
  workspaceId: string
  initialSlideshows: SlideshowSummaryResponse[]
  initialError?: string | null
  initialHasMore?: boolean
}

export function SlideshowStudioWorkspace({
  models,
  textModels,
  presets,
  workspaceId,
  initialSlideshows,
  initialError = null,
  initialHasMore = false,
}: SlideshowStudioWorkspaceProps) {
  return (
    <SlideshowStudioProvider>
      <div className="image-studio image-studio-workspace image-studio-home relative flex w-full flex-1 flex-col">
        <section
          id="slideshow-studio-composer"
          aria-label="Create a slideshow"
          className="relative px-4 pt-5 pb-7 sm:px-6 sm:pt-6 sm:pb-9 lg:px-8"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <Image
              src="/socialista-static-ads.webp"
              alt=""
              fill
              priority
              quality={80}
              sizes={STAGE_IMAGE_SIZES}
              className="object-cover object-[50%_16%] select-none"
            />
            <div className="image-studio-prompt-stage-scrim absolute inset-0" />
          </div>

          <div className="relative z-10">
            <div className="mx-auto mb-5 flex w-full max-w-5xl justify-end sm:mb-6">
              <StudioHomeCreateButton
                href={DASHBOARD_ROUTES.STUDIO.SLIDESHOW_CREATE}
                label="New blank project"
              />
            </div>

            <div className="mx-auto flex w-full max-w-[48rem] flex-col items-center">
              <h1 className="mb-5 text-center text-[1.625rem] font-semibold leading-none tracking-[-0.035em] text-white [text-shadow:0_1px_18px_rgb(0_0_0/0.45)] sm:mb-6 sm:text-[1.75rem]">
                Make the slideshow.
              </h1>
              <div className="w-full">
                <SlideshowPromptComposer models={models} textModels={textModels} presets={presets} />
              </div>
            </div>
          </div>
        </section>

        <SlideshowPresetRow presets={presets} />

        <SlideshowTemplatesGallery workspaceId={workspaceId} />

        <SlideshowList
          workspaceId={workspaceId}
          initialSlideshows={initialSlideshows}
          initialError={initialError}
          initialHasMore={initialHasMore}
        />
      </div>
    </SlideshowStudioProvider>
  )
}
