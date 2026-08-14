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
          className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-4 pb-[max(7rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] sm:px-6 lg:px-8"
        >
          <div className="image-studio-composer relative -mt-[3.25rem] sm:-mt-[4.25rem] lg:-mt-[4.5rem]">
            <div
              aria-hidden
              className="image-studio-composer-lift pointer-events-none absolute -inset-x-3 -top-5 bottom-6 sm:-inset-x-5 motion-reduce:hidden"
            />
            <div className="relative">
              <ImageGenerationPromptInput models={models} />
            </div>
          </div>
        </section>
      </div>
    </ImageStudioProvider>
  )
}
