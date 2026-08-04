export type SnapGuide = {
  orientation: 'vertical' | 'horizontal'
  /** Position as percent of canvas (0–100) */
  position: number
}

export type SnapTarget = {
  id: string
  x: number
  y: number
  width: number
  height: number
}

const SNAP_THRESHOLD_PCT = 1.2

type SnapEdge = { value: number; guide: number }

function collectEdges(target: SnapTarget): { x: SnapEdge[]; y: SnapEdge[] } {
  return {
    x: [
      { value: target.x, guide: target.x },
      { value: target.x + target.width / 2, guide: target.x + target.width / 2 },
      { value: target.x + target.width, guide: target.x + target.width },
    ],
    y: [
      { value: target.y, guide: target.y },
      { value: target.y + target.height / 2, guide: target.y + target.height / 2 },
      { value: target.y + target.height, guide: target.y + target.height },
    ],
  }
}

const CANVAS_X: SnapEdge[] = [
  { value: 0, guide: 0 },
  { value: 50, guide: 50 },
  { value: 100, guide: 100 },
]

const CANVAS_Y: SnapEdge[] = [
  { value: 0, guide: 0 },
  { value: 50, guide: 50 },
  { value: 100, guide: 100 },
]

export function snapLayerPosition(opts: {
  x: number
  y: number
  width: number
  height: number
  others: SnapTarget[]
}): { x: number; y: number; guides: SnapGuide[] } {
  const { width, height, others } = opts
  let { x, y } = opts
  const guides: SnapGuide[] = []

  const movingX: SnapEdge[] = [
    { value: x, guide: x },
    { value: x + width / 2, guide: x + width / 2 },
    { value: x + width, guide: x + width },
  ]
  const movingY: SnapEdge[] = [
    { value: y, guide: y },
    { value: y + height / 2, guide: y + height / 2 },
    { value: y + height, guide: y + height },
  ]

  const targetX = [...CANVAS_X]
  const targetY = [...CANVAS_Y]
  for (const other of others) {
    const edges = collectEdges(other)
    targetX.push(...edges.x)
    targetY.push(...edges.y)
  }

  let bestDx = SNAP_THRESHOLD_PCT
  let bestDy = SNAP_THRESHOLD_PCT
  let snapDx = 0
  let snapDy = 0
  let guideX: number | null = null
  let guideY: number | null = null

  for (const move of movingX) {
    for (const target of targetX) {
      const delta = target.value - move.value
      const abs = Math.abs(delta)
      if (abs < bestDx) {
        bestDx = abs
        snapDx = delta
        guideX = target.guide
      }
    }
  }

  for (const move of movingY) {
    for (const target of targetY) {
      const delta = target.value - move.value
      const abs = Math.abs(delta)
      if (abs < bestDy) {
        bestDy = abs
        snapDy = delta
        guideY = target.guide
      }
    }
  }

  if (guideX != null) {
    x += snapDx
    guides.push({ orientation: 'vertical', position: guideX })
  }
  if (guideY != null) {
    y += snapDy
    guides.push({ orientation: 'horizontal', position: guideY })
  }

  return { x, y, guides }
}
