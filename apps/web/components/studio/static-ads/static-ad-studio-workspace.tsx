'use client'

import { StaticAdFormatPresets } from '@/components/studio/static-ads/static-ad-format-presets'
import { StaticAdPromptInput } from './static-ad-prompt-input'
import { StaticAdStudioProvider } from './static-ad-studio-provider'
import { StaticAdTemplatesGallery } from './templates/static-ad-templates-gallery'
import type { Model } from '@socialista/types'
import Image from 'next/image'

const STAGE_IMAGE_SIZES = '(max-width: 768px) 100vw, 1200px'

type StaticAdStudioWorkspaceProps = {
  workspaceId: string
  models: Model[]
}

function StaticAdStudioBody({ workspaceId, models }: StaticAdStudioWorkspaceProps) {
  return (
    <div className="image-studio image-studio-workspace image-studio-home relative flex w-full flex-1 flex-col">
      <section
        id="static-ad-studio-composer"
        aria-label="Create a static ad"
        className="relative px-4 pt-8 pb-7 sm:px-6 sm:pt-10 sm:pb-9 lg:px-8"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <Image
            src="/socialista-static-ads.webp"
            alt=""
            fill
            priority
            quality={80}
            sizes={STAGE_IMAGE_SIZES}
            className="object-cover object-[50%_22%] select-none"
          />
          <div className="image-studio-prompt-stage-scrim absolute inset-0" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[48rem] flex-col items-center">
          <h1 className="mb-5 text-center text-[1.625rem] font-semibold leading-none tracking-[-0.035em] text-white [text-shadow:0_1px_18px_rgb(0_0_0/0.45)] sm:mb-6 sm:text-[1.75rem]">
            Make the ad.
          </h1>
          <div className="w-full">
            <StaticAdPromptInput models={models} workspaceId={workspaceId} />
          </div>
        </div>
      </section>

      <section
        aria-label="Formats"
        className="relative z-10 mx-auto mt-2 w-full max-w-5xl px-4 sm:px-6 lg:px-8"
      >
        <StaticAdFormatPresets />
      </section>

      <StaticAdTemplatesGallery />
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
