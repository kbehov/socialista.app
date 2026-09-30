import { cn } from '@/lib/utils'

import { IMAGE_TEMPLATES_SECTION } from './content'
import { FadeIn } from './fade-in'
import { getLandingImageTemplates } from './landing-image-templates-data'
import { LandingImageTemplatesShowcase } from './landing-image-templates-showcase'
import { landingContentGap, LANDING_STORY_INDEX } from './landing-classes'
import { Section } from './section'
import { LandingSectionIntro } from './section-header'
import { getModels } from '@/services/models.service'

async function loadImageModels() {
  try {
    const modelsRes = await getModels('limit=20&modelType=image&sort=-usageCount')
    return modelsRes.success ? (modelsRes.data?.models ?? []) : []
  } catch {
    return []
  }
}

export async function LandingImageTemplates() {
  const [templates, models] = await Promise.all([getLandingImageTemplates(), loadImageModels()])

  return (
    <Section id="image-templates" landingDivider alt>
      <FadeIn>
        <LandingSectionIntro
          titleId="image-templates-heading"
          storyIndex={LANDING_STORY_INDEX.imageTemplates}
          eyebrow={IMAGE_TEMPLATES_SECTION.eyebrow}
          eyebrowTone="accent"
          title={IMAGE_TEMPLATES_SECTION.title}
          titleAccent={IMAGE_TEMPLATES_SECTION.titleAccent}
          description={IMAGE_TEMPLATES_SECTION.description}
        />
      </FadeIn>

      <FadeIn delay={0.08} className={cn(landingContentGap, 'mx-auto max-w-6xl')}>
        <LandingImageTemplatesShowcase templates={templates} models={models} />
      </FadeIn>
    </Section>
  )
}
