import { cn } from '@/lib/utils'

import { VIDEOS_SECTION } from './content'
import { FadeIn } from './fade-in'
import { landingContentGap } from './landing-classes'
import { getLandingVideoTemplates } from './landing-videos-data'
import { LandingVideosEditor } from './landing-videos-editor'
import { Section } from './section'
import { LandingSectionIntro } from './section-header'
import { getModels } from '@/services/models.service'

async function loadVideoModels() {
  try {
    const modelsRes = await getModels('limit=20&modelType=video&sort=-usageCount')
    return modelsRes.success ? (modelsRes.data?.models ?? []) : []
  } catch {
    return []
  }
}

export async function LandingVideos() {
  const [templates, models] = await Promise.all([getLandingVideoTemplates(), loadVideoModels()])
  if (templates.length === 0) return null

  return (
    <Section id="videos" landingDivider alt>
      <FadeIn>
        <LandingSectionIntro
          titleId="videos-heading"
          eyebrow={VIDEOS_SECTION.eyebrow}
          title={VIDEOS_SECTION.title}
          titleAccent={VIDEOS_SECTION.titleAccent}
          description={VIDEOS_SECTION.description}
        />
      </FadeIn>

      <FadeIn delay={0.08} className={cn(landingContentGap, 'mx-auto w-full max-w-3xl')}>
        <LandingVideosEditor templates={templates} models={models} />
      </FadeIn>
    </Section>
  )
}
