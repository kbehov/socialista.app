/** Viewport-locked editors — main stays overflow-hidden; child owns layout. */
export const LOCKED_STUDIO_SHELL_CLASSES = [
  'studio-shell',
  'video-studio',
  'slideshow-studio',
  'ugc-studio',
  'post-composer',
] as const

/** Full-bleed studio surfaces — drop dashboard padding and max-width. */
export const EDGE_TO_EDGE_STUDIO_CLASSES = [
  'image-studio',
  ...LOCKED_STUDIO_SHELL_CLASSES,
] as const

/** @deprecated Use LOCKED_STUDIO_SHELL_CLASSES or EDGE_TO_EDGE_STUDIO_CLASSES */
export const STUDIO_SHELL_CLASSES = EDGE_TO_EDGE_STUDIO_CLASSES

function lockedStudioHasUtilities(utility: string): string {
  return LOCKED_STUDIO_SHELL_CLASSES.map(className => `[&:has(.${className})]:${utility}`).join(' ')
}

function edgeToEdgeStudioHasUtilities(utility: string): string {
  return EDGE_TO_EDGE_STUDIO_CLASSES.map(className => `[&:has(.${className})]:${utility}`).join(' ')
}

export const dashboardMainClassName = [
  'flex min-h-0 w-full min-w-0 flex-1 flex-col gap-(--spacing-dashboard-gap)',
  'overflow-y-auto overflow-x-hidden overscroll-y-contain sidebar-scrollbar',
  'px-(--spacing-dashboard-x) pt-1 pb-(--spacing-dashboard-y) sm:px-6 lg:px-8 lg:pb-10',
  edgeToEdgeStudioHasUtilities('gap-0'),
  lockedStudioHasUtilities('overflow-hidden'),
  edgeToEdgeStudioHasUtilities('!p-0'),
  edgeToEdgeStudioHasUtilities('!px-0'),
  edgeToEdgeStudioHasUtilities('!pb-0'),
].join(' ')
