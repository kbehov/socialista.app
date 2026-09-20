import { type CSSProperties, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type ShimmerBorderProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
  shimmerColor?: string
  shimmerDuration?: string
  borderRadius?: string
  borderWidth?: string
  background?: string
}

export function ShimmerBorder({
  children,
  className,
  contentClassName,
  shimmerColor = 'color-mix(in oklch, var(--landing-orange) 72%, white)',
  shimmerDuration = '4s',
  borderRadius = '1rem',
  borderWidth = '1.5px',
  background = '#ffffff',
}: ShimmerBorderProps) {
  const style = {
    '--spread': '90deg',
    '--shimmer-color': shimmerColor,
    '--radius': borderRadius,
    '--speed': shimmerDuration,
    '--cut': borderWidth,
    '--bg': background,
  } as CSSProperties

  return (
    <div
      className={cn('relative isolate overflow-hidden [border-radius:var(--radius)]', className)}
      style={style}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 overflow-hidden [border-radius:var(--radius)]',
          'blur-[1.5px]',
        )}
        aria-hidden="true"
      >
        <div className="@container-size absolute inset-0 aspect-square h-[100cqh] animate-shimmer-slide overflow-visible rounded-none">
          <div
            className="absolute -inset-full w-auto animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]"
          />
        </div>
      </div>

      <div
        className={cn(
          'relative z-0 m-[var(--cut)] overflow-hidden [border-radius:calc(var(--radius)-var(--cut))] [background:var(--bg)]',
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}
