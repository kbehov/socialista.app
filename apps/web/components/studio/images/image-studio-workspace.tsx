'use client'

import { ImageStudioProvider } from '@/components/studio/images/image-studio-provider'
import type { Generation, Model, Preset } from '@socialista/types'
import { ImageStudioHero } from './image-studio-hero'
import ImageGenerationPromptInput from './prompt-input'
import { RecentImagesStrip } from './recent-images-strip'

type ImageStudioWorkspaceProps = {
  models: Model[]
  presets: Preset[]
  recentGenerations?: Generation[]
}

export function ImageStudioWorkspace({
  models,
  presets,
  recentGenerations = [],
}: ImageStudioWorkspaceProps) {
  return (
    <ImageStudioProvider>
      <div className="image-studio image-studio-workspace image-studio-home relative flex w-full flex-1 flex-col">
        <ImageStudioHero presets={presets}>
          <section id="image-studio-composer" aria-label="Create an image">
            <ImageGenerationPromptInput models={models} presets={presets} />
          </section>
        </ImageStudioHero>

        <RecentImagesStrip generations={recentGenerations} />
      </div>
    </ImageStudioProvider>
  )
}
