/**
 * Placeholder landing media.
 * Swap these URLs for files in `public/landing/screenshots/` and `public/landing/ugc/`
 * when dashboard captures and generated clips are ready. Components import tokens only.
 */

const unsplash = (id: string, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const IMG = {
  heroCanvas: unsplash('photo-1529139574466-a303027c1d8b', 1200),
  heroStill1: unsplash('photo-1534528741775-53994a69daeb', 800),
  heroStill2: unsplash('photo-1524504388940-b1c1722653e1', 800),
  studioImages: unsplash('photo-1469334031218-e382a71b716b', 1000),
  studioImagesAlt: unsplash('photo-1483985988355-763728e1935b', 1000),
  adStill: unsplash('photo-1523275335684-37898b6baf30', 800),
  adStillAlt: unsplash('photo-1505740420928-5e560c06d30e', 800),
  slideshow: unsplash('photo-1490481651871-ab68de25d43d', 1000),
  influencer: unsplash('photo-1529626455594-4ff0802cfb7e', 800),
  influencerAlt: unsplash('photo-1531123897727-8f129e1688ce', 800),
  canvasFashion: unsplash('photo-1529139574466-a303027c1d8b', 1000),
  canvasWatch: unsplash('photo-1523275335684-37898b6baf30', 800),
  canvasLifestyle: unsplash('photo-1483985988355-763728e1935b', 1200),
  canvasSkincare: unsplash('photo-1556228720-195a672e8a03', 800),
  posterUgc1: unsplash('photo-1534528741775-53994a69daeb', 700),
  posterUgc3: unsplash('photo-1494790108377-be9c29b29330', 700),
  posterUgc4: unsplash('photo-1507003211169-0a1dd7228f2d', 700),
  posterUgc5: unsplash('photo-1524504388940-b1c1722653e1', 700),
  posterUgc6: unsplash('photo-1517841905240-472988babdf9', 700),
  posterUgc8: unsplash('photo-1529626455594-4ff0802cfb7e', 700),
  posterUgc9: unsplash('photo-1487412720507-e7ab37603c6f', 700),
  posterUgc12: unsplash('photo-1438761681033-6461ffad8d80', 700),
  gallery1: unsplash('photo-1596462502278-27bfdc403348', 800),
  gallery2: unsplash('photo-1572635196237-14b3f281503f', 800),
  gallery3: unsplash('photo-1542291026-7eec264c27ff', 800),
  gallery4: unsplash('photo-1505740420928-5e560c06d30e', 800),
} as const

export const VIDEO = {
  talking1: 'https://cdn.pixabay.com/video/2023/06/17/167569-837244635_tiny.mp4',
  talking2: 'https://cdn.pixabay.com/video/2023/07/28/173530-849610807_tiny.mp4',
  productHold: 'https://cdn.pixabay.com/video/2024/04/18/208442_small.mp4',
  lifestyle: 'https://cdn.pixabay.com/video/2024/03/31/206294_small.mp4',
  motion: 'https://cdn.pixabay.com/video/2024/03/31/206293_small.mp4',
  /** Placeholder for landing influencer phone mockup — swap for a real clip later. */
  influencerDemo:
    'https://cdn.socialista.app/workspaces/6a3106e25705ba0dff8871f0/c6a3261e-4188-4696-81a7-0e42e427b5fa.mp4',
} as const

export const GALLERY_FALLBACK = [
  IMG.gallery1,
  IMG.gallery2,
  IMG.gallery3,
  IMG.gallery4,
  IMG.adStill,
  IMG.adStillAlt,
] as const
