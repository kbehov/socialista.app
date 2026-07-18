export function getAspectRatioClass(aspectRatio?: string): string {
  switch (aspectRatio) {
    case '9:16':
      return 'aspect-[9/16]'
    case '16:9':
      return 'aspect-video'
    case '4:3':
      return 'aspect-[4/3]'
    default:
      return 'aspect-square'
  }
}

export const GENERATION_PREVIEW_FRAME_CLASS =
  'relative mx-auto w-full max-w-lg overflow-hidden rounded-xl border border-border/60 bg-muted/20 shadow-sm'
