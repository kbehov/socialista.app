'use client'

import { ImageStudioProvider } from '@/components/studio/images/image-studio-provider'
import type { Model } from '@socialista/types'
import { ExampleGallery } from './example-gallery'
import ImageGenerationPromptInput from './prompt-input'
import { StudioHero } from './studio-hero'

type ImageStudioWorkspaceProps = {
  models: Model[]
}

export function   ImageStudioWorkspace({ models }: ImageStudioWorkspaceProps) {
  return (
    <ImageStudioProvider>
      <div className="image-studio relative flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-140 overflow-hidden">
          <div className="absolute left-1/2 -top-28 h-112 w-220 -translate-x-1/2 rounded-full bg-foreground/[0.025] blur-[110px]" />
          <div className="absolute left-[10%] top-24 h-52 w-52 rounded-full bg-foreground/[0.015] blur-[90px]" />
          <div className="absolute right-[6%] top-36 h-44 w-64 rounded-full bg-foreground/[0.012] blur-[80px]" />
        </div>

        <div
          aria-hidden
          className="pointer-events-none sticky top-0 z-10 h-14 bg-linear-to-b from-background via-background/85 to-transparent motion-reduce:hidden"
        />

        <div className="relative flex flex-1 flex-col px-4 pb-28 pt-6 sm:px-6 sm:pt-10 lg:px-8">
          <div className="mx-auto w-full max-w-3xl space-y-7 sm:space-y-8">
            <StudioHero />
            <ImageGenerationPromptInput models={models} />
          </div>

          <div className="relative mx-auto mt-20 w-full max-w-6xl sm:mt-24 lg:mt-28">
            <ExampleGallery />
          </div>
        </div>
      </div>
    </ImageStudioProvider>
  )
}
