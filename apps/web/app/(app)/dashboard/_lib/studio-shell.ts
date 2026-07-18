export const STUDIO_SHELL_CLASSES = [
  'studio-shell',
  'video-studio',
  'slideshow-studio',
  'image-studio',
] as const

const studioShellSelector = STUDIO_SHELL_CLASSES.map(className => `.${className}`).join(',')

export const dashboardMainClassName = [
  'mx-auto flex min-h-0 w-full min-w-0 max-w-7xl flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto px-4 py-6 lg:px-6',
  `[&:has(${studioShellSelector})]:mx-0`,
  `[&:has(${studioShellSelector})]:max-w-none`,
  `[&:has(${studioShellSelector})]:gap-0`,
  `[&:has(${studioShellSelector})]:overflow-hidden`,
  `[&:has(${studioShellSelector})]:p-0`,
].join(' ')
