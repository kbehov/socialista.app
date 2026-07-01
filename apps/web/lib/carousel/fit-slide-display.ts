/** Fit slide canvas inside a box while preserving aspect ratio. */
export function fitSlideDisplaySize(
  containerWidth: number,
  containerHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  maxWidth?: number,
): { width: number; height: number } {
  if (containerWidth <= 0 || containerHeight <= 0 || canvasWidth <= 0 || canvasHeight <= 0) {
    return { width: 0, height: 0 }
  }

  const aspect = canvasWidth / canvasHeight
  let width = maxWidth ? Math.min(containerWidth, maxWidth) : containerWidth
  let height = width / aspect

  if (height > containerHeight) {
    height = containerHeight
    width = height * aspect
  }

  return { width, height }
}
