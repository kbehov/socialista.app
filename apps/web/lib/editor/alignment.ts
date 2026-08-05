export type PercentRect = {
  x: number
  y: number
  width: number
  height: number
}

export type AlignEdge = 'left' | 'right' | 'top' | 'bottom'
export type AlignAxis = 'horizontal' | 'vertical' | 'both'
export type AlignAnchor =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'

function clampRect(rect: PercentRect): PercentRect {
  return {
    x: rect.x,
    y: rect.y,
    width: Math.max(1, rect.width),
    height: Math.max(1, rect.height),
  }
}

export function centerHorizontally(rect: PercentRect): PercentRect {
  const next = clampRect(rect)
  return { ...next, x: 50 - next.width / 2 }
}

export function centerVertically(rect: PercentRect): PercentRect {
  const next = clampRect(rect)
  return { ...next, y: 50 - next.height / 2 }
}

export function centerBoth(rect: PercentRect): PercentRect {
  return centerVertically(centerHorizontally(rect))
}

export function alignToEdge(rect: PercentRect, edge: AlignEdge): PercentRect {
  const next = clampRect(rect)
  switch (edge) {
    case 'left':
      return { ...next, x: 0 }
    case 'right':
      return { ...next, x: 100 - next.width }
    case 'top':
      return { ...next, y: 0 }
    case 'bottom':
      return { ...next, y: 100 - next.height }
  }
}

export function alignToCanvas(rect: PercentRect, anchor: AlignAnchor): PercentRect {
  const next = clampRect(rect)
  switch (anchor) {
    case 'top-left':
      return { ...next, x: 0, y: 0 }
    case 'top-right':
      return { ...next, x: 100 - next.width, y: 0 }
    case 'bottom-left':
      return { ...next, x: 0, y: 100 - next.height }
    case 'bottom-right':
      return { ...next, x: 100 - next.width, y: 100 - next.height }
    case 'center':
      return centerBoth(next)
  }
}

export function alignAlongAxis(rect: PercentRect, axis: AlignAxis): PercentRect {
  if (axis === 'horizontal') return centerHorizontally(rect)
  if (axis === 'vertical') return centerVertically(rect)
  return centerBoth(rect)
}

/**
 * Evenly distribute rects along an axis between the first and last item
 * (by current start edge). Returns new positions keyed by input order.
 */
export function distributeEvenly(
  rects: PercentRect[],
  axis: 'x' | 'y',
): PercentRect[] {
  if (rects.length < 3) return rects.map(r => ({ ...r }))

  const keyed = rects.map((rect, index) => ({ rect: clampRect(rect), index }))
  const sorted = keyed.toSorted((a, b) =>
    axis === 'x' ? a.rect.x - b.rect.x : a.rect.y - b.rect.y,
  )

  const first = sorted[0]!
  const last = sorted[sorted.length - 1]!
  const start = axis === 'x' ? first.rect.x : first.rect.y
  const end =
    axis === 'x' ? last.rect.x + last.rect.width : last.rect.y + last.rect.height
  const totalSize = sorted.reduce(
    (sum, item) => sum + (axis === 'x' ? item.rect.width : item.rect.height),
    0,
  )
  const gap = (end - start - totalSize) / (sorted.length - 1)

  let cursor = start
  const nextByIndex = new Map<number, PercentRect>()
  for (const item of sorted) {
    const next = { ...item.rect }
    if (axis === 'x') next.x = cursor
    else next.y = cursor
    nextByIndex.set(item.index, next)
    cursor += (axis === 'x' ? item.rect.width : item.rect.height) + gap
  }

  return rects.map((_, index) => nextByIndex.get(index) ?? { ...rects[index]! })
}
