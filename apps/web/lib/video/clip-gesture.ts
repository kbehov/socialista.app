export type ClipResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

/** Wide enough for cover-fit clips (a landscape frame on a portrait canvas sits well outside 0–100). */
export const CLIP_POS_MIN = -1000
export const CLIP_POS_MAX = 1000
export const CLIP_WIDTH_MIN = 5
export const CLIP_WIDTH_MAX = 1200

/**
 * Clamp into [min, max] without pulling a value that already sits outside that range.
 * Gesture starts must keep their origin or the first pixel teleports the clip.
 */
export function clampGesture(value: number, min: number, max: number, origin: number): number {
  const lo = Math.min(min, origin)
  const hi = Math.max(max, origin)
  return Math.min(hi, Math.max(lo, value))
}

export type ClipResizeInput = {
  handle: ClipResizeHandle
  pointerDx: number
  pointerDy: number
  startX: number
  startY: number
  startWidth: number
  startHeightPct: number
  rotation: number
  canvasWidthPx: number
  canvasHeightPx: number
}

/**
 * Aspect-locked resize. The corner follows the pointer on the axis that moved
 * farther, in the clip's local space, so a slow drag stays 1:1 and pulling a
 * handle inward shrinks the frame. The opposite corner stays put.
 */
export function resizeClipFromPointer(input: ClipResizeInput): { x: number; y: number; width: number } {
  const canvasW = Math.max(1, input.canvasWidthPx)
  const canvasH = Math.max(1, input.canvasHeightPx)
  const startWidth = Math.max(0.01, input.startWidth)
  const startHeight = Math.max(0.01, input.startHeightPct)

  const boxW = (startWidth / 100) * canvasW
  const boxH = (startHeight / 100) * canvasH

  const inv = (-input.rotation * Math.PI) / 180
  const cosInv = Math.cos(inv)
  const sinInv = Math.sin(inv)
  const dxLocal = input.pointerDx * cosInv - input.pointerDy * sinInv
  const dyLocal = input.pointerDx * sinInv + input.pointerDy * cosInv

  const signX = input.handle.includes('e') ? 1 : input.handle.includes('w') ? -1 : 0
  const signY = input.handle.includes('s') ? 1 : input.handle.includes('n') ? -1 : 0

  let scale = 1
  if (signX !== 0 && signY !== 0) {
    const outX = signX * dxLocal
    const outY = signY * dyLocal
    const scaleX = boxW > 0 ? (boxW + outX) / boxW : 1
    const scaleY = boxH > 0 ? (boxH + outY) / boxH : 1
    scale = Math.abs(outX) >= Math.abs(outY) ? scaleX : scaleY
  } else if (signX !== 0 && boxW > 0) {
    scale = (boxW + signX * dxLocal) / boxW
  } else if (signY !== 0 && boxH > 0) {
    scale = (boxH + signY * dyLocal) / boxH
  }

  if (!Number.isFinite(scale)) scale = 1
  scale = Math.max(0.01, scale)

  const nextWidth = clampGesture(startWidth * scale, CLIP_WIDTH_MIN, CLIP_WIDTH_MAX, startWidth)
  const appliedScale = nextWidth / startWidth
  const nextHeight = startHeight * appliedScale
  const dWPx = ((nextWidth - startWidth) / 100) * canvasW
  const dHPx = ((nextHeight - startHeight) / 100) * canvasH

  const localShiftX = (signX * dWPx) / 2
  const localShiftY = (signY * dHPx) / 2
  const fwd = (input.rotation * Math.PI) / 180
  const cosFwd = Math.cos(fwd)
  const sinFwd = Math.sin(fwd)
  const shiftXPx = localShiftX * cosFwd - localShiftY * sinFwd
  const shiftYPx = localShiftX * sinFwd + localShiftY * cosFwd

  const nextX = input.startX + startWidth / 2 + (shiftXPx / canvasW) * 100 - nextWidth / 2
  const nextY = input.startY + startHeight / 2 + (shiftYPx / canvasH) * 100 - nextHeight / 2

  return {
    x: clampGesture(nextX, CLIP_POS_MIN, CLIP_POS_MAX, input.startX),
    y: clampGesture(nextY, CLIP_POS_MIN, CLIP_POS_MAX, input.startY),
    width: nextWidth,
  }
}
