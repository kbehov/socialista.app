'use client'

import { imageStudioHomeRootClassName } from '@/components/dashboard/studio-shell'
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
        description="Describe the scene — attach references with @image1 when you need them."
        footer={<ImageStudioPromptExtras />}
      >
        <ImageGenerationPromptInput models={models} />
      </StudioHomeComposerSection>

      <StudioHomeBelowSection ariaLabel="Templates">
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
