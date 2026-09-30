import { cn } from '@/lib/utils'

import { VIDEOS_SECTION } from './content'
import { FadeIn } from './fade-in'
import { landingContentGap, LANDING_STORY_INDEX } from './landing-classes'
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

  return (
    <Section id="videos" landingDivider>
      <FadeIn>
        <LandingSectionIntro
          titleId="videos-heading"
          storyIndex={LANDING_STORY_INDEX.videos}
          eyebrow={VIDEOS_SECTION.eyebrow}
          eyebrowTone="accent"
          title={VIDEOS_SECTION.title}
          titleAccent={VIDEOS_SECTION.titleAccent}
          description={VIDEOS_SECTION.description}
        />
      </FadeIn>

      <FadeIn delay={0.08} className={cn(landingContentGap, 'mx-auto max-w-5xl')}>
        <LandingVideosEditor templates={templates} models={models} />
      </FadeIn>
    </Section>
  )
}
