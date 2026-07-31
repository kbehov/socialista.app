'use client'

import { ImageStudioProvider } from '@/components/studio/images/image-studio-provider'
import type { Model } from '@socialista/types'
import { ExampleGallery } from './example-gallery'
import ImageGenerationPromptInput from './prompt-input'
import { StudioHero } from './studio-hero'

type ImageStudioWorkspaceProps = {
  models: Model[]
}

export function ImageStudioWorkspace({ models }: ImageStudioWorkspaceProps) {
  return (
    <ImageStudioProvider>
      <div className="image-studio relative flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] overflow-hidden"
        >
          <div className="absolute left-1/2 top-[-6rem] h-[26rem] w-[52rem] -translate-x-1/2 rounded-full bg-foreground/[0.02] blur-[100px]" />
          <div className="absolute left-[12%] top-20 h-48 w-48 rounded-full bg-foreground/[0.015] blur-[80px]" />
          <div className="absolute right-[8%] top-32 h-40 w-56 rounded-full bg-foreground/[0.012] blur-[72px]" />
        </div>

        <div
          aria-hidden
          className="pointer-events-none sticky top-0 z-10 h-12 bg-linear-to-b from-background via-background/90 to-transparent motion-reduce:hidden"
        />

        <div className="relative flex flex-1 flex-col px-4 pb-24 pt-5 sm:px-6 sm:pt-7 lg:px-8">
          <div className="mx-auto w-full max-w-3xl space-y-8 sm:space-y-9">
            <StudioHero />
            <ImageGenerationPromptInput models={models} />
          </div>

          <div className="relative mx-auto mt-16 w-full max-w-6xl sm:mt-20 lg:mt-24">
            <div
              aria-hidden
              className="mb-12 h-px w-full bg-linear-to-r from-transparent via-border/60 to-transparent sm:mb-14"
            />
            <ExampleGallery />
          </div>
        </div>
      </div>
    </ImageStudioProvider>
  )
}
