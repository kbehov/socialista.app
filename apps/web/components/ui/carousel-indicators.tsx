'use client'

import { cn } from '@/lib/utils'

type CarouselIndicatorsProps = {
  count: number
  activeIndex: number
  onSelect?: (index: number) => void
  className?: string
  label?: string
}

export function CarouselIndicators({
  count,
  activeIndex,
  onSelect,
  className,
  label = 'Carousel slides',
}: CarouselIndicatorsProps) {
  if (count <= 1) return null

  return (
    <div
      className={cn('flex items-center justify-center gap-1.5', className)}
      role="tablist"
      aria-label={label}
    >
      {Array.from({ length: count }, (_, index) => {
        const isActive = index === activeIndex

        if (onSelect) {
          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => onSelect(index)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 ease-out',
                isActive
                  ? 'w-4 bg-foreground'
                  : 'w-1.5 bg-foreground/25 hover:bg-foreground/40'
              )}
            />
          )
        }

        return (
          <span
            key={index}
            role="tab"
            aria-selected={isActive}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300 ease-out',
              isActive ? 'w-4 bg-foreground' : 'w-1.5 bg-foreground/25'
            )}
          />
        )
      })}
    </div>
  )
}
