'use client'

import { imageStudioHomeRootClassName } from '@/components/dashboard/studio-shell'
import { ImageIdeaChips } from '@/components/studio/images/image-idea-chips'
import { ImageStudioProvider } from '@/components/studio/images/image-studio-provider'
import { ImageStudioPromptExtras } from '@/components/studio/images/image-studio-prompt-extras'
import { StudioHomeBelowSection } from '@/components/studio/studio-home-below-section'
import { StudioHomeComposerSection } from '@/components/studio/studio-home-composer-section'
import type { Model, StudioTemplateCategoryDto } from '@socialista/types'
import ImageGenerationPromptInput from './prompt-input'
import { ImageTemplatesGallery } from './image-templates-gallery'

type ImageStudioWorkspaceProps = {
  models: Model[]
  templateCategories: StudioTemplateCategoryDto[]
}

function ImageStudioWorkspaceBody({ models, templateCategories }: ImageStudioWorkspaceProps) {
  return (
    <div className={imageStudioHomeRootClassName}>
      <StudioHomeComposerSection
        id="image-studio-composer"
        ariaLabel="Create an image"
        title="What are we posting today?"
        description="Attach your product with @image1 — we'll handle the rest."
        contentMaxWidth="roomy"
        footer={<ImageStudioPromptExtras />}
      >
        <div className="flex w-full flex-col gap-3">
          <ImageIdeaChips compact />
          <ImageGenerationPromptInput models={models} />
        </div>
      </StudioHomeComposerSection>

      <StudioHomeBelowSection ariaLabel="Templates" className="max-w-6xl">
        <ImageTemplatesGallery models={models} templateCategories={templateCategories} />
      </StudioHomeBelowSection>
    </div>
  )
}

export function ImageStudioWorkspace({ models, templateCategories }: ImageStudioWorkspaceProps) {
  return (
    <ImageStudioProvider>
      <ImageStudioWorkspaceBody models={models} templateCategories={templateCategories} />
    </ImageStudioProvider>
  )
}
