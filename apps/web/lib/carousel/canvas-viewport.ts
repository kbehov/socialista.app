/** Fit slide artboard inside a fixed workspace at 100% zoom. */
export const EDITOR_WORKSPACE_PADDING = 20

/** Tighter inset for slideshow editor — maximizes readable canvas area. */
export const SLIDESHOW_WORKSPACE_PADDING = 4

/** Tighter inset for video preview — maximizes readable canvas area. */
export const VIDEO_PREVIEW_WORKSPACE_PADDING = 4

/** Minimum share of workspace width the slideshow preview should target. */
export const SLIDESHOW_MIN_PREVIEW_WIDTH_RATIO = 0.48

/** Absolute floor for slideshow preview width (px). */
export const SLIDESHOW_MIN_PREVIEW_WIDTH_PX = 360

/** Max scale-up applied when the height-fit preview would otherwise look too small. */
export const SLIDESHOW_MAX_COMFORT_SCALE = 1.85

/** Extra top/bottom breathing room so the preview does not touch the carousel edges. */
export const SLIDESHOW_WORKSPACE_VERTICAL_INSET = 120

/** Inset reserved for carousel progress chrome when capping preview height. */
export const SLIDESHOW_CAROUSEL_CHROME_INSET = 40

/** Top chrome for slide progress dots and counter in the editor carousel. */
export const CAROUSEL_PREVIEW_TOP_CHROME = 28

/** Horizontal breathing room for prev/next slide controls. */
export const CAROUSEL_PREVIEW_SIDE_CHROME = 40

type SlideshowFitOptions = {
  capPreviewHeight?: boolean
}

export function fitArtboardInWorkspace(
  workspaceWidth: number,
  workspaceHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  padding = EDITOR_WORKSPACE_PADDING,
): { width: number; height: number } {
  if (workspaceWidth <= 0 || workspaceHeight <= 0 || canvasWidth <= 0 || canvasHeight <= 0) {
    return { width: 0, height: 0 }
  }

  const availWidth = Math.max(workspaceWidth - padding * 2, 1)
  const availHeight = Math.max(workspaceHeight - padding * 2, 1)
  const aspect = canvasWidth / canvasHeight

  let width = availWidth
  let height = width / aspect

  if (height > availHeight) {
    height = availHeight
    width = height * aspect
  }

  return { width: Math.round(width), height: Math.round(height) }
}

/** Fit slideshow artboard with minimal padding and a readability boost for portrait formats. */
export function fitSlideshowArtboardInWorkspace(
  workspaceWidth: number,
  workspaceHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  options: SlideshowFitOptions = {},
): { width: number; height: number } {
  const { capPreviewHeight = false } = options
  const aspect = canvasWidth / canvasHeight
  const verticalInset = capPreviewHeight ? SLIDESHOW_CAROUSEL_CHROME_INSET : SLIDESHOW_WORKSPACE_VERTICAL_INSET
  const effectiveHeight = Math.max(workspaceHeight - verticalInset, 1)
  const maxHeight = Math.max(effectiveHeight - SLIDESHOW_WORKSPACE_PADDING * 2, 1)

  const fit = fitArtboardInWorkspace(
    workspaceWidth,
    effectiveHeight,
    canvasWidth,
    canvasHeight,
    SLIDESHOW_WORKSPACE_PADDING,
  )

  if (fit.width <= 0 || workspaceWidth <= 0) return fit

  const targetMinWidth = Math.max(
    SLIDESHOW_MIN_PREVIEW_WIDTH_PX,
    Math.round(workspaceWidth * SLIDESHOW_MIN_PREVIEW_WIDTH_RATIO),
  )

  if (fit.width >= targetMinWidth) return fit

  const scaleUp = Math.min(SLIDESHOW_MAX_COMFORT_SCALE, targetMinWidth / fit.width)
  let width = fit.width * scaleUp
  let height = fit.height * scaleUp

  if (capPreviewHeight && height > maxHeight) {
    height = maxHeight
    width = height * aspect
    if (width < fit.width || height < fit.height) {
      return fit
    }
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  }
}

/** Fit carousel editor preview — always reserves chrome so size stays stable across selection states. */
export function fitCarouselPreviewInWorkspace(
  workspaceWidth: number,
  workspaceHeight: number,
  canvasWidth: number,
  canvasHeight: number,
): { width: number; height: number } {
  return fitArtboardInWorkspace(
    Math.max(1, workspaceWidth - CAROUSEL_PREVIEW_SIDE_CHROME),
    Math.max(1, workspaceHeight - CAROUSEL_PREVIEW_TOP_CHROME),
    canvasWidth,
    canvasHeight,
    VIDEO_PREVIEW_WORKSPACE_PADDING,
  )
}

/** Fit video preview within workspace bounds. */
export function fitVideoPreviewInWorkspace(
  workspaceWidth: number,
  workspaceHeight: number,
  canvasWidth: number,
  canvasHeight: number,
): { width: number; height: number } {
  return fitArtboardInWorkspace(
    workspaceWidth,
    workspaceHeight,
    canvasWidth,
    canvasHeight,
    VIDEO_PREVIEW_WORKSPACE_PADDING,
  )
}
