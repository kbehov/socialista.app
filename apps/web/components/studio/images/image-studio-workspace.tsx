'use client'

import { ImageStudioProvider } from '@/components/studio/images/image-studio-provider'
import type { Model, StudioTemplateCategoryDto } from '@socialista/types'
import Image from 'next/image'
import { ImageTemplatesGallery } from './image-templates-gallery'
import ImageGenerationPromptInput from './prompt-input'

const STAGE_IMAGE_SIZES = '(max-width: 768px) 100vw, 1200px'

type ImageStudioWorkspaceProps = {
  models: Model[]
  templateCategories: StudioTemplateCategoryDto[]
}

export function ImageStudioWorkspace({ models, templateCategories }: ImageStudioWorkspaceProps) {
  return (
    <ImageStudioProvider>
      <div className="image-studio image-studio-workspace image-studio-home relative flex w-full flex-1 flex-col">
        <section
          id="image-studio-composer"
          aria-label="Create an image"
          className="relative px-4 pt-8 pb-7 sm:px-6 sm:pt-10 sm:pb-9 lg:px-8"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <Image
              src="/studio-image.png"
              alt=""
              fill
              priority
              quality={80}
              sizes={STAGE_IMAGE_SIZES}
              className="object-cover object-[50%_42%] select-none"
            />
            <div className="image-studio-prompt-stage-scrim absolute inset-0" />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-[48rem] flex-col items-center">
            <h1 className="mb-5 text-center text-[1.625rem] font-semibold leading-none tracking-[-0.035em] text-white [text-shadow:0_1px_18px_rgb(0_0_0/0.45)] sm:mb-6 sm:text-[1.75rem]">
              Make the image.
            </h1>
            <div className="w-full">
              <ImageGenerationPromptInput models={models} />
            </div>
          </div>
        </section>

        <section
          aria-label="Templates"
          className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-1 pb-16 sm:px-6 sm:pb-20 lg:px-8"
        >
          <ImageTemplatesGallery models={models} templateCategories={templateCategories} />
        </section>
      </div>
    </ImageStudioProvider>
  )
}
