import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { Iphone } from '@/components/ui/iphone'

import {
  AD_CARDS,
  FEATURE_ACCOUNTS,
  FEATURE_ADS,
  FEATURE_ANALYTICS,
  FEATURE_CONTEXT,
  FEATURE_GENERATIONS,
  FEATURE_IMAGES,
  FEATURE_INFLUENCERS,
  FEATURE_POSTS,
  FEATURE_SLIDESHOWS,
  FEATURE_UGC,
  FEATURE_VIDEOS,
  PLATFORMS,
  SLIDESHOW_SLIDES,
} from './content'
import { FadeIn } from './fade-in'
import { FeatureChapter } from './feature-chapter'
import styles from './landing.module.css'
import { IMG, TALENT, VIDEO } from './media'
import { MediaFrame } from './media-frame'
import { MockupAnalytics } from './mockups/mockup-analytics'
import { MockupComposer } from './mockups/mockup-composer'
import { MockupContext } from './mockups/mockup-context'
import { Section } from './section'
import { SectionHeader } from './section-header'

const AD_IMAGES = [IMG.watch, IMG.sneaker, IMG.headphones, IMG.sunglasses] as const
const SLIDE_IMAGES = [IMG.fashion1, IMG.p5, IMG.beauty, IMG.skincare] as const
const IMAGE_MASONRY = [IMG.p1, IMG.fashion2, IMG.p6, IMG.p10, IMG.lifestyle, IMG.p13] as const
const GEN_THUMBS = [IMG.p3, IMG.watch, IMG.p8, IMG.fashion3, IMG.p11, IMG.skincare] as const
const GEN_LABELS = ['UGC hook v3', 'Watch still', 'Reel cut', 'Lookbook', 'Talent still', 'Serum ad'] as const

function ImagesVisual() {
  return (
    <div className={styles.masonry} aria-hidden="true">
      {IMAGE_MASONRY.map(src => (
        <MediaFrame key={src} src={src} className={`${styles.mediaCard} ${styles.masonryItem}`} sizes="220px" />
      ))}
    </div>
  )
}

function VideosVisual() {
  return (
    <div className={styles.phoneRow} aria-hidden="true">
      <div className={styles.phone}>
        <Iphone src={IMG.p5} videoSrc={VIDEO.beach} />
      </div>
      <div className={`${styles.phone} ${styles.phoneCenter}`}>
        <Iphone src={IMG.p1} videoSrc={VIDEO.tea} />
      </div>
      <div className={styles.phone}>
        <Iphone src={IMG.fashion1} videoSrc={VIDEO.horses} />
      </div>
    </div>
  )
}

function SlideshowVisual() {
  return (
    <div className={styles.slideStrip} aria-hidden="true">
      {SLIDESHOW_SLIDES.map((slide, i) => (
        <div key={slide.title} className={styles.slideCard}>
          <MediaFrame src={SLIDE_IMAGES[i] ?? IMG.fashion1} className={styles.slideMedia} sizes="240px" />
          <div className="space-y-1 p-3">
            <p className={styles.eyebrow}>{slide.kicker}</p>
            <p className="text-sm font-medium tracking-tight">{slide.title}</p>
            <p className="text-xs text-muted-foreground">{slide.caption}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function AdsVisual() {
  return (
    <div className={styles.adGrid} aria-hidden="true">
      {AD_CARDS.map((ad, i) => (
        <div key={ad.product} className={styles.adCard}>
          <MediaFrame
            src={AD_IMAGES[i] ?? IMG.watch}
            className={styles.adMedia}
            sizes="240px"
            objectPosition="50% 50%"
          />
          <div className="p-3">
            <p className="text-sm font-medium tracking-tight">{ad.product}</p>
            <p className="text-xs text-muted-foreground">{ad.price}</p>
            <span className={styles.adCta}>{ad.cta}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function InfluencersVisual() {
  return (
    <div className={styles.talentGrid}>
      {TALENT.map(person => (
        <figure key={person.name} className={styles.talentCard}>
          <MediaFrame src={person.src} className={`${styles.mediaCard} ${styles.talentPhoto}`} sizes="180px" />
          <figcaption className="px-0.5 text-sm font-medium tracking-tight">{person.name}</figcaption>
        </figure>
      ))}
    </div>
  )
}

function UgcVisual() {
  return (
    <div className={styles.phoneRow} aria-hidden="true">
      <div className={styles.phone}>
        <Iphone src={IMG.p3} />
      </div>
      <div className={`${styles.phone} ${styles.phoneCenter}`}>
        <Iphone src={IMG.p8} videoSrc={VIDEO.tea} />
      </div>
      <div className={styles.phone}>
        <Iphone src={IMG.p15} />
      </div>
    </div>
  )
}

function AccountsVisual() {
  return (
    <div className={styles.accountList} aria-hidden="true">
      {PLATFORMS.slice(0, 6).map((platform, i) => (
        <div key={platform.id} className={styles.accountRow}>
          <SocialPlatformIcon provider={platform.id} size={18} />
          <span className="text-sm font-medium">{platform.label}</span>
          <span className={i === 5 ? `${styles.accountStatus} ${styles.accountStatusMuted}` : styles.accountStatus}>
            {i === 5 ? 'Pending' : 'Connected'}
          </span>
        </div>
      ))}
    </div>
  )
}

function GenerationsVisual() {
  return (
    <div className={styles.genGrid} aria-hidden="true">
      {GEN_THUMBS.map((src, i) => (
        <div key={src} className={styles.genCard}>
          <MediaFrame src={src} className={styles.genMedia} sizes="200px" />
          <div className="flex items-center justify-between gap-2 px-2.5 py-2">
            <p className="truncate text-[0.6875rem] font-medium">{GEN_LABELS[i] ?? 'Generation'}</p>
            <p className="shrink-0 text-[0.625rem] text-muted-foreground">{i < 2 ? '2h ago' : '1d ago'}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function StudioFeatures() {
  return (
    <>
      <FeatureChapter
        id="images"
        eyebrow={FEATURE_IMAGES.eyebrow}
        title={FEATURE_IMAGES.title}
        description={FEATURE_IMAGES.description}
        points={FEATURE_IMAGES.points}
        visual={<ImagesVisual />}
      />
      <FeatureChapter
        id="videos"
        eyebrow={FEATURE_VIDEOS.eyebrow}
        title={FEATURE_VIDEOS.title}
        description={FEATURE_VIDEOS.description}
        points={FEATURE_VIDEOS.points}
        visual={<VideosVisual />}
        reverse
        alt
      />
      <Section id="slideshows" border>
        <FadeIn>
          <SectionHeader
            eyebrow={FEATURE_SLIDESHOWS.eyebrow}
            title={FEATURE_SLIDESHOWS.title}
            description={FEATURE_SLIDESHOWS.description}
          />
        </FadeIn>
        <FadeIn delay={0.06} className="mt-10">
          <SlideshowVisual />
        </FadeIn>
      </Section>
      <Section id="ads" border alt>
        <FadeIn>
          <SectionHeader
            eyebrow={FEATURE_ADS.eyebrow}
            title={FEATURE_ADS.title}
            description={FEATURE_ADS.description}
          />
        </FadeIn>
        <FadeIn delay={0.06} className="mt-10">
          <AdsVisual />
        </FadeIn>
      </Section>
      <Section id="influencers" border>
        <FadeIn>
          <SectionHeader
            eyebrow={FEATURE_INFLUENCERS.eyebrow}
            title={FEATURE_INFLUENCERS.title}
            description={FEATURE_INFLUENCERS.description}
          />
        </FadeIn>
        <FadeIn delay={0.06} className="mt-10">
          <InfluencersVisual />
        </FadeIn>
      </Section>
      <Section id="ugc" border alt>
        <FadeIn>
          <SectionHeader
            eyebrow={FEATURE_UGC.eyebrow}
            title={FEATURE_UGC.title}
            description={FEATURE_UGC.description}
            align="center"
          />
        </FadeIn>
        <FadeIn delay={0.08} className="mx-auto mt-12 max-w-3xl">
          <UgcVisual />
        </FadeIn>
      </Section>
    </>
  )
}

export function PlatformFeatures() {
  return (
    <div id="publish" className="scroll-mt-20">
      <FeatureChapter
        id="accounts"
        eyebrow={FEATURE_ACCOUNTS.eyebrow}
        title={FEATURE_ACCOUNTS.title}
        description={FEATURE_ACCOUNTS.description}
        points={FEATURE_ACCOUNTS.points}
        visual={<AccountsVisual />}
      />
      <FeatureChapter
        id="posts"
        eyebrow={FEATURE_POSTS.eyebrow}
        title={FEATURE_POSTS.title}
        description={FEATURE_POSTS.description}
        points={FEATURE_POSTS.points}
        visual={<MockupComposer />}
        reverse
        alt
      />
    </div>
  )
}

export function WorkspaceFeatures() {
  return (
    <div id="workspace" className="scroll-mt-20">
      <FeatureChapter
        id="analytics"
        eyebrow={FEATURE_ANALYTICS.eyebrow}
        title={FEATURE_ANALYTICS.title}
        description={FEATURE_ANALYTICS.description}
        points={FEATURE_ANALYTICS.points}
        visual={<MockupAnalytics />}
      />
      <FeatureChapter
        id="context"
        eyebrow={FEATURE_CONTEXT.eyebrow}
        title={FEATURE_CONTEXT.title}
        description={FEATURE_CONTEXT.description}
        points={FEATURE_CONTEXT.points}
        visual={<MockupContext />}
        reverse
        alt
      />
      <Section id="generations" border>
        <FadeIn>
          <SectionHeader
            eyebrow={FEATURE_GENERATIONS.eyebrow}
            title={FEATURE_GENERATIONS.title}
            description={FEATURE_GENERATIONS.description}
          />
        </FadeIn>
        <FadeIn delay={0.06} className="mt-10">
          <GenerationsVisual />
        </FadeIn>
      </Section>
    </div>
  )
}
