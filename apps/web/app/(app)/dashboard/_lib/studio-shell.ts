export const STUDIO_SHELL_CLASSES = [
  'studio-shell',
  'video-studio',
  'slideshow-studio',
  'image-studio',
  'post-composer',
] as const

/** One `:has()` per class — Tailwind arbitrary variants break on commas. */
function studioHasUtilities(utility: string): string {
  return STUDIO_SHELL_CLASSES.map(className => `[&:has(.${className})]:${utility}`).join(' ')
}

export const dashboardMainClassName = [
  'mx-auto flex min-h-0 w-full min-w-0 max-w-7xl flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto px-4 py-6 lg:px-6',
  studioHasUtilities('mx-0'),
  studioHasUtilities('max-w-none'),
  studioHasUtilities('w-full'),
  studioHasUtilities('gap-0'),
  studioHasUtilities('overflow-hidden'),
  studioHasUtilities('p-0'),
].join(' ')
