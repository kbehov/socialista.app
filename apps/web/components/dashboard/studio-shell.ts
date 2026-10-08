/**
 * Dashboard app shell — layout chrome for App Router (`dashboard-shell`, main scrollport, page column).
 * Canvas and sidebar both use `--background`. `--sidebar` aliases that color.
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
export const EDGE_TO_EDGE_STUDIO_CLASSES = ['image-studio', ...LOCKED_STUDIO_SHELL_CLASSES] as const

/** @deprecated Use LOCKED_STUDIO_SHELL_CLASSES or EDGE_TO_EDGE_STUDIO_CLASSES */
export const STUDIO_SHELL_CLASSES = EDGE_TO_EDGE_STUDIO_CLASSES

/** Sidebar + inset shell (App Router dashboard layouts). */
export const dashboardShellProviderClassName = 'dashboard-shell h-svh max-h-svh overflow-hidden'

export const dashboardShellInsetClassName =
  'dashboard-inset flex h-svh max-h-svh min-w-0 flex-1 flex-col overflow-hidden bg-background text-foreground'

/** Page column inside the scrollport — lists, analytics, settings. */
export const dashboardPageClassName = 'dashboard-page flex min-h-0 w-full min-w-0 flex-1 flex-col'

/** Main scroll area — padded content. Studio routes drop inset via `.dashboard-main:has()` in globals.css. */
export const dashboardMainClassName = 'dashboard-main sidebar-scrollbar'

/** Generation run / locked editor wrapper (matches globals `.image-studio.studio-shell`). */
export const lockedStudioShellRootClassName =
  'image-studio studio-shell relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground'

/** Studio home — full width inside dashboard; main scrollport keeps vertical scroll. */
export const imageStudioHomeRootClassName =
  'image-studio image-studio-workspace image-studio-home relative flex w-full flex-1 flex-col bg-background text-foreground'

export const videoStudioRootClassName =
  'video-studio flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background text-foreground'

export const slideshowStudioRootClassName =
  'slideshow-studio flex h-full max-h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden overscroll-none bg-background'

export const ugcStudioRootClassName =
  'ugc-studio flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background text-foreground'

/** Post composer — zero dashboard inset via `:has(.post-composer)` on main. */
export const postComposerRootClassName =
  'post-composer flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground px-4'
