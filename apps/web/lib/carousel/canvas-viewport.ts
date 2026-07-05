/** Fit slide artboard inside a fixed workspace at 100% zoom. */
export const EDITOR_WORKSPACE_PADDING = 20

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
