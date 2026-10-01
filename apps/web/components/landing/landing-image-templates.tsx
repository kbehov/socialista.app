import { cn } from '@/lib/utils'

import { IMAGE_TEMPLATES_SECTION } from './content'
import { FadeIn } from './fade-in'
import { getLandingImageTemplates } from './landing-image-templates-data'
import { LandingImageTemplatesShowcase } from './landing-image-templates-showcase'
import { landingContentGap } from './landing-classes'
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
  if (templates.length === 0) return null

  return (
    <Section id="image-templates" landingDivider>
      <FadeIn>
        <LandingSectionIntro
          titleId="image-templates-heading"
          eyebrow={IMAGE_TEMPLATES_SECTION.eyebrow}
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
