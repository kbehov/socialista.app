'use client'

import { imageStudioHomeRootClassName } from '@/components/dashboard/studio-shell'
import { ImageStudioProvider } from '@/components/studio/images/image-studio-provider'
import type { Model, StudioTemplateCategoryDto } from '@socialista/types'
import { useTheme } from 'next-themes'
import { ImageTemplatesGallery } from './image-templates-gallery'
import ImageGenerationPromptInput from './prompt-input'

type ImageStudioWorkspaceProps = {
  models: Model[]
  templateCategories: StudioTemplateCategoryDto[]
}

export function ImageStudioWorkspace({ models, templateCategories }: ImageStudioWorkspaceProps) {
  useTheme()
  return (
    <ImageStudioProvider>
      <div className={imageStudioHomeRootClassName}>
        <section
          id="image-studio-composer"
          aria-label="Create an image"
          className="relative px-4 pt-5 pb-7 sm:px-6 sm:pt-6 sm:pb-9 lg:px-8"
        >
          {/* <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              quality={80}
              sizes={STAGE_IMAGE_SIZES}
              className="object-cover object-[50%_42%] select-none"
            />
            <div className="image-studio-prompt-stage-scrim absolute inset-0" />
          </div> */}

          <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center">
            <h1 className="mb-5 text-center text-xl font-medium tracking-[-0.02em] text-foreground">
              🖼️ Imagine it, create it.
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
          <ImageTemplatesGallery models={models} templateCategories={templateCategories} hideTitle={true} />
        </section>
      </div>
    </ImageStudioProvider>
  )
}
