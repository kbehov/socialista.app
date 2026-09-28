/**
 * Dashboard app shell — layout chrome for App Router (`dashboard-shell`, main scrollport, page column).
 * Linear minimal rhythm: inset via `.dashboard-main` in globals.css; flat sections via `dashboardSurface`.
 */
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

/** Sidebar + inset shell (App Router dashboard layouts). */
export const dashboardShellProviderClassName = 'dashboard-shell h-svh max-h-svh overflow-hidden'

export const dashboardShellInsetClassName =
  'dashboard-inset flex h-svh max-h-svh min-w-0 flex-1 flex-col overflow-hidden'

/** Page column inside the scrollport — lists, analytics, settings. */
export const dashboardPageClassName = 'dashboard-page flex min-h-0 w-full min-w-0 flex-1 flex-col'

/** Main scroll area — padded content; studio routes zero out via :has() below. */
export const dashboardMainClassName = [
  'dashboard-main sidebar-scrollbar',
  // Complete literals — Tailwind does not emit classes built with ${}.
  '[&:has(.image-studio)]:gap-0 [&:has(.studio-shell)]:gap-0 [&:has(.video-studio)]:gap-0 [&:has(.slideshow-studio)]:gap-0 [&:has(.ugc-studio)]:gap-0 [&:has(.post-composer)]:gap-0',
  '[&:has(.studio-shell)]:overflow-hidden [&:has(.video-studio)]:overflow-hidden [&:has(.slideshow-studio)]:overflow-hidden [&:has(.ugc-studio)]:overflow-hidden [&:has(.post-composer)]:overflow-hidden',
  '[&:has(.image-studio)]:!p-0 [&:has(.studio-shell)]:!p-0 [&:has(.video-studio)]:!p-0 [&:has(.slideshow-studio)]:!p-0 [&:has(.ugc-studio)]:!p-0 [&:has(.post-composer)]:!p-0',
  '[&:has(.image-studio)]:[&_.dashboard-page]:max-w-none [&:has(.studio-shell)]:[&_.dashboard-page]:max-w-none [&:has(.video-studio)]:[&_.dashboard-page]:max-w-none [&:has(.slideshow-studio)]:[&_.dashboard-page]:max-w-none [&:has(.ugc-studio)]:[&_.dashboard-page]:max-w-none [&:has(.post-composer)]:[&_.dashboard-page]:max-w-none',
].join(' ')

/** Generation run / locked editor wrapper (matches globals `.image-studio.studio-shell`). */
export const lockedStudioShellRootClassName =
  'image-studio studio-shell relative flex min-h-0 flex-1 flex-col overflow-hidden'

/** Studio home — full width inside dashboard; main scrollport keeps vertical scroll. */
export const imageStudioHomeRootClassName =
  'image-studio image-studio-workspace image-studio-home relative flex w-full flex-1 flex-col'

export const videoStudioRootClassName =
  'video-studio flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background text-foreground'

export const slideshowStudioRootClassName =
  'slideshow-studio flex h-full max-h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden overscroll-none bg-background'

export const ugcStudioRootClassName =
  'ugc-studio flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background text-foreground'

/** Post composer — zero dashboard inset via `:has(.post-composer)` on main. */
export const postComposerRootClassName =
  'post-composer flex min-h-0 flex-1 flex-col overflow-hidden'
