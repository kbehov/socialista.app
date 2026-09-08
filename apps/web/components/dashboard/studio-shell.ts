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

export const dashboardMainClassName = [
  'flex min-h-0 w-full min-w-0 flex-1 flex-col gap-(--spacing-dashboard-gap)',
  'overflow-y-auto overflow-x-hidden overscroll-y-contain sidebar-scrollbar',
  'px-(--spacing-dashboard-x) pt-1 pb-(--spacing-dashboard-y) sm:px-6 lg:px-8 lg:pb-10',
  // Complete literals — Tailwind does not emit classes built with ${}.
  '[&:has(.image-studio)]:gap-0 [&:has(.studio-shell)]:gap-0 [&:has(.video-studio)]:gap-0 [&:has(.slideshow-studio)]:gap-0 [&:has(.ugc-studio)]:gap-0 [&:has(.post-composer)]:gap-0',
  '[&:has(.studio-shell)]:overflow-hidden [&:has(.video-studio)]:overflow-hidden [&:has(.slideshow-studio)]:overflow-hidden [&:has(.ugc-studio)]:overflow-hidden [&:has(.post-composer)]:overflow-hidden',
  '[&:has(.image-studio)]:!p-0 [&:has(.studio-shell)]:!p-0 [&:has(.video-studio)]:!p-0 [&:has(.slideshow-studio)]:!p-0 [&:has(.ugc-studio)]:!p-0 [&:has(.post-composer)]:!p-0',
].join(' ')
