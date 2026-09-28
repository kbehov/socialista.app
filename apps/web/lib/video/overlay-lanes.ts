export const TEXT_OVERLAY_LANE_HEIGHT = 28
export const MIN_OVERLAY_BLOCK_PX = 16

type TimedOverlay = {
  id: string
  startTime: number
  endTime: number
}

/** Assign each overlay a row so blocks that overlap in time (or min width) don't cover each other. */
export function assignOverlayLanes(overlays: TimedOverlay[], pxPerSec: number): Map<string, number> {
  const sorted = overlays.toSorted(
    (a, b) => a.startTime - b.startTime || a.endTime - b.endTime || a.id.localeCompare(b.id),
  )
  const laneEnds: number[] = []
  const lanes = new Map<string, number>()

  for (const overlay of sorted) {
    const left = overlay.startTime * pxPerSec
    const right = left + Math.max(MIN_OVERLAY_BLOCK_PX, (overlay.endTime - overlay.startTime) * pxPerSec)
    let lane = 0
    for (; lane < laneEnds.length; lane++) {
      if (laneEnds[lane]! <= left) break
    }
    if (lane === laneEnds.length) laneEnds.push(right)
    else laneEnds[lane] = right
    lanes.set(overlay.id, lane)
  }

  return lanes
}

export function overlayLaneCount(overlays: TimedOverlay[], pxPerSec: number): number {
  if (overlays.length === 0) return 1
  let maxLane = 0
  for (const lane of assignOverlayLanes(overlays, pxPerSec).values()) {
    if (lane > maxLane) maxLane = lane
  }
  return maxLane + 1
}

export function textOverlayRowHeight(laneCount: number): number {
  return Math.max(TEXT_OVERLAY_LANE_HEIGHT, laneCount * TEXT_OVERLAY_LANE_HEIGHT)
}
