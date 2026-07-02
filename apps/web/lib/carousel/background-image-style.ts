import type { BackgroundImageAdjustment, CropAreaPercentages } from '@socialista/types'
import type { CSSProperties } from 'react'

export function croppedAreaStyle(area: CropAreaPercentages): CSSProperties {
  return {
    position: 'absolute',
    maxWidth: 'none',
    width: `${(100 / area.width) * 100}%`,
    height: `${(100 / area.height) * 100}%`,
    transform: `translate(${( -area.x / area.width) * 100}%, ${( -area.y / area.height) * 100}%)`,
    transformOrigin: 'top left',
  }
}

/** Preview width used before pan offsets were stored as viewport fractions. */
const LEGACY_ZOOM_REFERENCE_WIDTH = 560

function isNormalizedPanOffset(value: number): boolean {
  return Math.abs(value) <= 2
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Resolve a saved zoom adjustment into a pixel-space transform that always
 * keeps the image covering the canvas. Scale is floored at 1 (cover-fit) and
 * pan offsets are clamped to the range that keeps the scaled image edge at or
 * beyond the wrapper edge, so no empty space can ever appear.
 */
export function resolveZoomPanPosition(
  adjustment: Extract<BackgroundImageAdjustment, { type: 'zoom' }>,
  containerWidth: number,
  containerHeight: number,
): { scale: number; positionX: number; positionY: number } {
  const { scale, positionX, positionY } = adjustment

  const safeScale = Math.max(1, scale)
  const maxOffsetX = ((safeScale - 1) * containerWidth) / 2
  const maxOffsetY = ((safeScale - 1) * containerHeight) / 2

  if (isNormalizedPanOffset(positionX) && isNormalizedPanOffset(positionY)) {
    return {
      scale: safeScale,
      positionX: clamp(positionX * containerWidth, -maxOffsetX, maxOffsetX),
      positionY: clamp(positionY * containerHeight, -maxOffsetY, maxOffsetY),
    }
  }

  const legacyScale = containerWidth / LEGACY_ZOOM_REFERENCE_WIDTH
  return {
    scale: safeScale,
    positionX: clamp(positionX * legacyScale, -maxOffsetX, maxOffsetX),
    positionY: clamp(positionY * legacyScale, -maxOffsetY, maxOffsetY),
  }
}

export function normalizeZoomPanPosition(
  scale: number,
  positionX: number,
  positionY: number,
  containerWidth: number,
  containerHeight: number,
): Extract<BackgroundImageAdjustment, { type: 'zoom' }> {
  return {
    type: 'zoom',
    scale,
    positionX: containerWidth > 0 ? positionX / containerWidth : 0,
    positionY: containerHeight > 0 ? positionY / containerHeight : 0,
  }
}

export function backgroundImageContainerStyle(
  adjustment: BackgroundImageAdjustment,
): CSSProperties | undefined {
  if (adjustment.type === 'zoom' || adjustment.type === 'crop') {
    return { overflow: 'hidden' }
  }
  return undefined
}

export function usesObjectCover(adjustment: BackgroundImageAdjustment): boolean {
  return adjustment.type === 'cover'
}

export function usesZoomPan(adjustment: BackgroundImageAdjustment): adjustment is Extract<
  BackgroundImageAdjustment,
  { type: 'zoom' }
> {
  return adjustment.type === 'zoom'
}

export function backgroundImageStyle(adjustment: BackgroundImageAdjustment): CSSProperties | undefined {
  if (adjustment.type === 'crop') {
    return croppedAreaStyle(adjustment.area)
  }
  return undefined
}
