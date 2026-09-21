'use client'

import { ImageStudioProvider } from '@/components/studio/images/image-studio-provider'
import type { Model, StudioTemplateCategoryDto } from '@socialista/types'
import { ImageStudioHero } from './image-studio-hero'
import { ImageTemplatesGallery } from './image-templates-gallery'
import ImageGenerationPromptInput from './prompt-input'

type ImageStudioWorkspaceProps = {
  models: Model[]
  templateCategories: StudioTemplateCategoryDto[]
}

export function ImageStudioWorkspace({ models, templateCategories }: ImageStudioWorkspaceProps) {
  return (
    <ImageStudioProvider>
      <div className="image-studio image-studio-workspace image-studio-home relative flex w-full flex-1 flex-col">
        <ImageStudioHero>
          <section id="image-studio-composer" aria-label="Create an image">
            <ImageGenerationPromptInput models={models} />
          </section>
        </ImageStudioHero>

        <section
          aria-label="Browse inspirations"
          className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-12 pt-3 sm:px-6 sm:pb-14 sm:pt-5 lg:px-8"
        >
          <ImageTemplatesGallery models={models} templateCategories={templateCategories} />
        </section>
      </div>
    </ImageStudioProvider>
  )
}
