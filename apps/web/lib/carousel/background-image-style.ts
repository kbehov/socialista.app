import type { BackgroundImageAdjustment, BackgroundImageTransform, CropAreaPercentages } from '@socialista/types'
import type { CSSProperties } from 'react'
import { DEFAULT_BACKGROUND_TRANSFORM, MIN_BACKGROUND_SCALE } from './defaults'

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Legacy frame shape saved before scale/offset model. */
type LegacyFrame = {
  x?: number
  y?: number
  width?: number
  height?: number
}

function migrateLegacyFrame(raw: LegacyFrame): BackgroundImageTransform {
  const x = raw.x ?? 0
  const y = raw.y ?? 0
  const width = raw.width ?? 100
  const height = raw.height ?? 100

  if (x === 0 && y === 0 && width === 100 && height === 100) {
    return DEFAULT_BACKGROUND_TRANSFORM
  }

  const scale = Math.max(width / 100, height / 100, MIN_BACKGROUND_SCALE)
  return {
    scale,
    offsetX: (x + width / 2 - 50) / 50,
    offsetY: (y + height / 2 - 50) / 50,
  }
}

export function resolveBackgroundTransform(adjustment: BackgroundImageAdjustment): BackgroundImageTransform {
  if (adjustment.type === 'frame') {
    if ('offsetX' in adjustment && typeof adjustment.offsetX === 'number') {
      return {
        scale: Math.max(MIN_BACKGROUND_SCALE, adjustment.scale),
        offsetX: adjustment.offsetX,
        offsetY: adjustment.offsetY,
      }
    }
    return migrateLegacyFrame(adjustment as LegacyFrame & { scale?: number })
  }

  if (adjustment.type === 'zoom') {
    return {
      scale: Math.max(MIN_BACKGROUND_SCALE, adjustment.scale),
      offsetX: adjustment.positionX,
      offsetY: adjustment.positionY,
    }
  }

  if (adjustment.type === 'cover') {
    return DEFAULT_BACKGROUND_TRANSFORM
  }

  return DEFAULT_BACKGROUND_TRANSFORM
}

export function transformToAdjustment(
  transform: BackgroundImageTransform,
): Extract<BackgroundImageAdjustment, { type: 'frame' }> {
  return { type: 'frame', ...transform }
}

export function resolveTransformPixels(
  transform: BackgroundImageTransform,
  containerWidth: number,
  containerHeight: number,
): { scale: number; translateX: number; translateY: number } {
  const scale = Math.max(MIN_BACKGROUND_SCALE, transform.scale)
  const maxOffsetX = ((scale - 1) * containerWidth) / 2
  const maxOffsetY = ((scale - 1) * containerHeight) / 2

  return {
    scale,
    translateX: clamp(transform.offsetX * containerWidth, -maxOffsetX, maxOffsetX),
    translateY: clamp(transform.offsetY * containerHeight, -maxOffsetY, maxOffsetY),
  }
}

export function normalizeTransform(
  scale: number,
  translateX: number,
  translateY: number,
  containerWidth: number,
  containerHeight: number,
): BackgroundImageTransform {
  return {
    scale: Math.max(MIN_BACKGROUND_SCALE, scale),
    offsetX: containerWidth > 0 ? translateX / containerWidth : 0,
    offsetY: containerHeight > 0 ? translateY / containerHeight : 0,
  }
}

export function backgroundImageTransformStyle(
  transform: BackgroundImageTransform,
  containerWidth: number,
  containerHeight: number,
): CSSProperties {
  const { scale, translateX, translateY } = resolveTransformPixels(
    transform,
    containerWidth,
    containerHeight,
  )

  return {
    width: '100%',
    height: '100%',
    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
    transformOrigin: 'center center',
  }
}

export function usesFrame(adjustment: BackgroundImageAdjustment): boolean {
  return adjustment.type === 'frame' || adjustment.type === 'cover' || adjustment.type === 'zoom'
}

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
