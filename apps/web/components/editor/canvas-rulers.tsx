'use client'

import { cn } from '@/lib/utils'

export const CANVAS_RULER_SIZE = 18

type CanvasRulersProps = {
  canvasWidth: number
  canvasHeight: number
  displayWidth: number
  displayHeight: number
  showCenterMarkers?: boolean
  className?: string
}

/**
 * Rulers sit in a reserved gutter around the artboard (not over content).
 * Parent should size to displayWidth+RULER × displayHeight+RULER and pad the artboard.
 */
export function CanvasRulers({
  canvasWidth,
  canvasHeight,
  displayWidth,
  displayHeight,
  showCenterMarkers = true,
  className,
}: CanvasRulersProps) {
  if (displayWidth <= 0 || displayHeight <= 0 || canvasWidth <= 0 || canvasHeight <= 0) {
    return null
  }

  const scaleX = displayWidth / canvasWidth
  const scaleY = displayHeight / canvasHeight
  const hTicks = buildTicks(canvasWidth, scaleX, displayWidth)
  const vTicks = buildTicks(canvasHeight, scaleY, displayHeight)

  return (
    <div
      className={cn('pointer-events-none absolute left-0 top-0 z-20', className)}
      aria-hidden
      data-canvas-rulers
      style={{
        width: displayWidth + CANVAS_RULER_SIZE,
        height: displayHeight + CANVAS_RULER_SIZE,
      }}
    >
      <div
        className="absolute left-0 top-0 border-b border-r border-border/50 bg-muted/40"
        style={{ width: CANVAS_RULER_SIZE, height: CANVAS_RULER_SIZE }}
      />

      <div
        className="absolute top-0 overflow-hidden border-b border-border/50 bg-muted/40"
        style={{ left: CANVAS_RULER_SIZE, width: displayWidth, height: CANVAS_RULER_SIZE }}
      >
        <svg width={displayWidth} height={CANVAS_RULER_SIZE} className="block">
          {hTicks.map(tick => (
            <g key={`h-${tick.value}`}>
              <line
                x1={tick.px}
                y1={tick.major ? 5 : 11}
                x2={tick.px}
                y2={CANVAS_RULER_SIZE}
                stroke="currentColor"
                className="text-muted-foreground/45"
                strokeWidth={1}
              />
              {tick.major && tick.value > 0 ? (
                <text x={tick.px + 3} y={11} className="fill-muted-foreground/80" fontSize={8}>
                  {tick.value}
                </text>
              ) : null}
            </g>
          ))}
          {showCenterMarkers ? (
            <line
              x1={displayWidth / 2}
              y1={0}
              x2={displayWidth / 2}
              y2={CANVAS_RULER_SIZE}
              stroke="currentColor"
              className="text-primary/60"
              strokeWidth={1}
            />
          ) : null}
        </svg>
      </div>

      <div
        className="absolute left-0 overflow-hidden border-r border-border/50 bg-muted/40"
        style={{ top: CANVAS_RULER_SIZE, width: CANVAS_RULER_SIZE, height: displayHeight }}
      >
        <svg width={CANVAS_RULER_SIZE} height={displayHeight} className="block">
          {vTicks.map(tick => (
            <g key={`v-${tick.value}`}>
              <line
                x1={tick.major ? 5 : 11}
                y1={tick.px}
                x2={CANVAS_RULER_SIZE}
                y2={tick.px}
                stroke="currentColor"
                className="text-muted-foreground/45"
                strokeWidth={1}
              />
              {tick.major && tick.value > 0 ? (
                <text x={2} y={tick.px + 9} className="fill-muted-foreground/80" fontSize={8}>
                  {tick.value}
                </text>
              ) : null}
            </g>
          ))}
          {showCenterMarkers ? (
            <line
              x1={0}
              y1={displayHeight / 2}
              x2={CANVAS_RULER_SIZE}
              y2={displayHeight / 2}
              stroke="currentColor"
              className="text-primary/60"
              strokeWidth={1}
            />
          ) : null}
        </svg>
      </div>
    </div>
  )
}

type Tick = { value: number; px: number; major: boolean }

function buildTicks(canvasSize: number, scale: number, displaySize: number): Tick[] {
  const step = niceStep(canvasSize)
  const ticks: Tick[] = []
  for (let value = 0; value <= canvasSize; value += step / 2) {
    const px = value * scale
    if (px > displaySize + 0.5) break
    ticks.push({
      value: Math.round(value),
      px,
      major: Math.abs(value % step) < 0.001 || Math.abs(value) < 0.001,
    })
  }
  return ticks
}

function niceStep(canvasSize: number): number {
  if (canvasSize <= 600) return 50
  if (canvasSize <= 1200) return 100
  if (canvasSize <= 2400) return 200
  return 400
}
