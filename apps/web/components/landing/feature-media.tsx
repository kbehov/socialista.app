import { getModels } from '@/services/models.service'
import { cn } from '@/lib/utils'

import { SchedulingFeatureMedia } from './feature-scheduling-media'
import type { FeatureMediaId } from './features'
import { InfluencerSwipeCarousel } from './influencer-swipe-carousel'
import { getLandingImageTemplates } from './landing-image-templates-data'
import { LandingImageTemplatesShowcase } from './landing-image-templates-showcase'
import { landingMediaPanel, landingWorkflowPanel, landingWorkflowPanelDark } from './landing-classes'
import { getLandingStaticAdMarqueeImages } from './landing-static-ad-marquee-data'
import { UgcAdsMedia } from './landing-ugc-ads'
import { getLandingVideoTemplates } from './landing-videos-data'
import { LandingVideosEditor } from './landing-videos-editor'
import { WorkflowAnalyticsMockup } from './landing-workflow-mockups'
import { SlideshowShowcase } from './slideshow-floating-cards'
import { StaticAdsMarquee } from './static-ads-marquee'

async function loadModels(modelType: 'image' | 'video') {
  try {
    const modelsRes = await getModels(`limit=20&modelType=${modelType}&sort=-usageCount`)
    return modelsRes.success ? (modelsRes.data?.models ?? []) : []
  } catch {
    return []
  }
}

async function StaticAdsFeatureMedia() {
  const imageUrls = await getLandingStaticAdMarqueeImages()

  return (
    <div
      className={cn(
        landingMediaPanel,
        'relative min-h-[18rem] overflow-hidden sm:min-h-[22rem] lg:min-h-[26rem]',
      )}
    >
      <StaticAdsMarquee imageUrls={imageUrls} />
    </div>
  )
}

async function ImagesFeatureMedia() {
  const [templates, models] = await Promise.all([getLandingImageTemplates(), loadModels('image')])
  if (templates.length === 0) return null
  return <LandingImageTemplatesShowcase templates={templates} models={models} />
}

async function VideosFeatureMedia() {
  const [templates, models] = await Promise.all([getLandingVideoTemplates(), loadModels('video')])
  if (templates.length === 0) return null

  return (
    <div className="mx-auto w-full max-w-3xl">
      <LandingVideosEditor templates={templates} models={models} />
    </div>
  )
}

/** Product visual for a feature page, reused from the homepage studio mockups. */
export async function FeatureMedia({ media }: { media: FeatureMediaId }) {
  switch (media) {
    case 'influencers':
      return (
        <div className="flex justify-center py-2">
          <InfluencerSwipeCarousel />
        </div>
      )
    case 'ugc':
      return <UgcAdsMedia />
    case 'slideshows':
      return (
        <div className={cn(landingWorkflowPanelDark, 'overflow-hidden py-6 sm:py-8')}>
          <SlideshowShowcase compact />
        </div>
      )
    case 'static-ads':
      return <StaticAdsFeatureMedia />
    case 'images':
      return <ImagesFeatureMedia />
    case 'videos':
      return <VideosFeatureMedia />
    case 'scheduling':
      return <SchedulingFeatureMedia />
    case 'analytics':
      return (
        <div className={landingWorkflowPanel}>
          <WorkflowAnalyticsMockup />
        </div>
      )
  }
}
