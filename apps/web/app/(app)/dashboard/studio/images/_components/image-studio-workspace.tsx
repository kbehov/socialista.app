'use client'

import type { Model } from '@socialista/types'
import { ImageStudioProvider } from '../_lib/studio-context'
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
          className="pointer-events-none sticky top-0 z-10 h-8 bg-gradient-to-b from-background via-background/80 to-transparent motion-reduce:hidden"
        />

        <div className="flex flex-1 flex-col px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          <div className="mx-auto w-full max-w-3xl space-y-8">
            <StudioHero />
            <ImageGenerationPromptInput models={models} />
          </div>

          <div className="mx-auto mt-14 w-full max-w-5xl border-t border-border/50 pt-12 sm:mt-16 sm:pt-14">
            <ExampleGallery />
          </div>
        </div>
      </div>
    </ImageStudioProvider>
  )
}
