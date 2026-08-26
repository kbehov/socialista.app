'use client'

import { ImageStudioProvider } from '@/components/studio/images/image-studio-provider'
import type { Model } from '@socialista/types'
import ImageGenerationPromptInput from './prompt-input'
import { StudioHero } from './studio-hero'

type ImageStudioWorkspaceProps = {
  models: Model[]
}

export function ImageStudioWorkspace({ models }: ImageStudioWorkspaceProps) {
  return (
    <ImageStudioProvider>
      <div className="image-studio image-studio-workspace relative flex w-full flex-col">
        <StudioHero />

        <section
          id="image-studio-composer"
          aria-label="Create an image"
          className="relative z-10 mx-auto flex w-full max-w-5xl flex-col px-4 pt-5 pb-[max(7rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] sm:px-6 sm:pt-6 lg:px-8"
        >
          <ImageGenerationPromptInput models={models} />
        </section>
      </div>
    </ImageStudioProvider>
  )
}
