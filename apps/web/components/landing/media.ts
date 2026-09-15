/**
 * Placeholder landing media.
 * Swap these URLs for files in `public/landing/screenshots/` and `public/landing/ugc/`
 * when dashboard captures and generated clips are ready. Components import tokens only.
 */

export const IMG = {
  creatorPickerBg:
    'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/generated/d4c2a762-0edc-4abe-9d04-28ef34c932e6.webp',
  shapeAdPreview:
    'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/generated/848bed46-6361-4832-b367-92312aa54c9e.webp',
  heroCanvas: '/landing/product-ugc.webp', heroStill1: '/landing/product-ugc.webp', heroStill2: '/landing/product-carousel.webp',
  studioImages: '/landing/product-carousel.webp', studioImagesAlt: '/landing/product-ad.webp', adStill: '/landing/product-ad.webp', adStillAlt: '/landing/product-carousel.webp', slideshow: '/landing/product-carousel.webp', influencer: '/landing/product-ugc.webp', influencerAlt: '/landing/product-ugc.webp', canvasFashion: '/landing/product-carousel.webp', canvasWatch: '/landing/product-ad.webp', canvasLifestyle: '/landing/product-carousel.webp', canvasSkincare: '/landing/product-ad.webp', posterUgc1: '/landing/product-ugc.webp', posterUgc3: '/landing/product-ugc.webp', posterUgc4: '/landing/product-carousel.webp', posterUgc5: '/landing/product-carousel.webp', posterUgc6: '/landing/product-ugc.webp', posterUgc8: '/landing/product-ugc.webp', posterUgc9: '/landing/product-carousel.webp', posterUgc12: '/landing/product-ugc.webp', gallery1: '/landing/product-ad.webp', gallery2: '/landing/product-carousel.webp', gallery3: '/landing/product-ugc.webp', gallery4: '/landing/product-ad.webp',
} as const

/** AI creator portraits for the influencer section swipe stack (inside iPhone mockup). */
export const INFLUENCER_SWIPE_IMAGES = [
  'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/generated/62cf587a-0881-450b-8e61-3c3307c14210.webp',
  'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/generated/4ebdc264-890e-469f-86fc-264a89a1a37a.webp',
  'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/generated/463a3d30-9772-42a8-8a71-87bca31a11c2.webp',
  'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/generated/d4c2a762-0edc-4abe-9d04-28ef34c932e6.webp',
  'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/generated/45f14f87-c4ae-49fd-b8d2-de86f1cda4aa.webp',
  'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/generated/cf549365-9d59-464d-ab28-e7aaa2a99a05.webp',
] as const

export const HERO_MARQUEE_POSTERS = [
  'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/generated/80c729f7-b40e-4d88-889b-24253cec5e68.webp',
  'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/generated/848bed46-6361-4832-b367-92312aa54c9e.webp',
  'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/99c06fb1-6917-4ca2-982a-4e2a0d3250c1.webp',
  'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/generated/5b2a2ad9-faa7-4d4a-8e9a-83e4fc4e0d5f.webp',
] as const

export const VIDEO = {
  creatorPicker:
    'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/cebc0724-ff49-4443-bfca-b68a2272f6fb.mp4',
  shapeAdPreview:
    'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/c6a3261e-4188-4696-81a7-0e42e427b5fa.mp4',
  formatsPreview:
    'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/bc48c441-e461-441e-b92f-8e3adae9b901.mp4',
  heroIphone:
    'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/e3e58730-021d-418e-a614-19f123ffd4af.mp4',
  talking1: '', talking2: '', productHold: '', lifestyle: '', motion: '',
  /** Placeholder for landing influencer phone mockup — swap for a real clip later. */
  influencerDemo: '',
} as const

export const LANDING_CLIPS = {
  ugc: {
    poster: IMG.posterUgc1,
    video: VIDEO.heroIphone,
    objectPosition: '50% 18%',
  },
  video: {
    poster: IMG.studioImages,
    video: VIDEO.productHold,
    objectPosition: '50% 20%',
  },
  carousel: {
    poster: IMG.posterUgc5,
    video: VIDEO.lifestyle,
    objectPosition: '50% 22%',
  },
  ads: {
    poster: IMG.adStill,
    video: VIDEO.motion,
    objectPosition: '50% 50%',
  },
  talent: {
    poster: IMG.posterUgc8,
    video: VIDEO.talking2,
    objectPosition: '50% 16%',
  },
  slideshow: {
    poster: IMG.slideshow,
    video: VIDEO.lifestyle,
    objectPosition: '50% 24%',
  },
  influencer: {
    poster: IMG.influencer,
    video: VIDEO.talking1,
    objectPosition: '50% 18%',
  },
} as const

export type LandingClipId = keyof typeof LANDING_CLIPS

export const LANDING_CLIP_ITEMS = (Object.keys(LANDING_CLIPS) as LandingClipId[]).map(id => ({
  id,
  ...LANDING_CLIPS[id],
}))

export const GALLERY_FALLBACK = [
  IMG.gallery1,
  IMG.gallery2,
  IMG.gallery3,
  IMG.gallery4,
  IMG.adStill,
  IMG.adStillAlt,
] as const
