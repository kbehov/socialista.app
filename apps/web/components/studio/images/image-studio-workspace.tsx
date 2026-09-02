'use client'

import { ImageStudioProvider } from '@/components/studio/images/image-studio-provider'
import type { Generation, Model } from '@socialista/types'
import { ImageStudioHero } from './image-studio-hero'
import ImageGenerationPromptInput from './prompt-input'
import { RecentImagesStrip } from './recent-images-strip'

type ImageStudioWorkspaceProps = {
  models: Model[]
  recentGenerations?: Generation[]
}

export function ImageStudioWorkspace({
  models,
  recentGenerations = [],
}: ImageStudioWorkspaceProps) {
  return (
    <ImageStudioProvider>
      <div className="image-studio image-studio-workspace image-studio-home relative flex w-full flex-1 flex-col">
        <ImageStudioHero />

        <section
          id="image-studio-composer"
          aria-label="Create an image"
          className="relative z-10 mx-auto flex w-full max-w-[48rem] flex-col px-4 pb-6 sm:px-6 lg:px-8 -mt-7 sm:-mt-8"
        >
          <ImageGenerationPromptInput models={models} />
        </section>

        <RecentImagesStrip generations={recentGenerations} />
      </div>
    </ImageStudioProvider>
  )
}
