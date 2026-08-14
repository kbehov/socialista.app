export const STUDIO_SHELL_CLASSES = [
  'studio-shell',
  'video-studio',
  'slideshow-studio',
  'image-studio',
  'ugc-studio',
  'post-composer',
] as const

/** One `:has()` per class — Tailwind arbitrary variants break on commas. */
function studioHasUtilities(utility: string): string {
  return STUDIO_SHELL_CLASSES.map(className => `[&:has(.${className})]:${utility}`).join(' ')
}

export const dashboardMainClassName = [
  'mx-auto flex min-h-0 w-full min-w-0 max-w-screen-7xl flex-1 flex-col gap-6 px-4 pt-0 pb-6 ',
  studioHasUtilities('mx-0'),
  studioHasUtilities('max-w-none'),
  studioHasUtilities('w-full'),
  studioHasUtilities('gap-0'),
  studioHasUtilities('overflow-hidden'),
  studioHasUtilities('!p-0'),
  studioHasUtilities('!px-0'),
  studioHasUtilities('!pb-0'),
].join(' ')
