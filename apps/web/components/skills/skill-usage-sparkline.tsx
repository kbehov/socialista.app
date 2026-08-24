import { cn } from '@/lib/utils'

type SkillUsageSparklineProps = {
  value: number
  max: number
  className?: string
}

const WIDTH = 56
const HEIGHT = 20
const PAD_X = 1
const PAD_Y = 2
const POINT_COUNT = 8

function usageCoords(intensity: number) {
  const innerW = WIDTH - PAD_X * 2
  const innerH = HEIGHT - PAD_Y * 2
  const points: { x: number; y: number }[] = []

  for (let i = 0; i < POINT_COUNT; i += 1) {
    const t = i / (POINT_COUNT - 1)
    const eased = t * t * (3 - 2 * t)
    points.push({
      x: PAD_X + t * innerW,
      y: PAD_Y + innerH * (1 - eased * intensity),
    })
  }

  return points
}

export function SkillUsageSparkline({ value, max, className }: SkillUsageSparklineProps) {
  const intensity = max > 0 ? Math.min(1, value / max) : 0
  const points = usageCoords(intensity)
  const first = points[0]
  const last = points[points.length - 1]
  if (!first || !last) return null

  const line = points.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')
  const area = `M${first.x.toFixed(1)},${(HEIGHT - PAD_Y).toFixed(1)} ${points
    .map(point => `L${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(' ')} L${last.x.toFixed(1)},${(HEIGHT - PAD_Y).toFixed(1)} Z`

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn('pointer-events-none shrink-0 text-muted-foreground/70', className)}
      aria-hidden
    >
      <path d={area} fill="currentColor" fillOpacity={0.1} />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
