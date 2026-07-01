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

export function resolveZoomPanPosition(
  adjustment: Extract<BackgroundImageAdjustment, { type: 'zoom' }>,
  containerWidth: number,
  containerHeight: number,
): { scale: number; positionX: number; positionY: number } {
  const { scale, positionX, positionY } = adjustment

  if (isNormalizedPanOffset(positionX) && isNormalizedPanOffset(positionY)) {
    return {
      scale,
      positionX: positionX * containerWidth,
      positionY: positionY * containerHeight,
    }
  }

  const legacyScale = containerWidth / LEGACY_ZOOM_REFERENCE_WIDTH
  return {
    scale,
    positionX: positionX * legacyScale,
    positionY: positionY * legacyScale,
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
