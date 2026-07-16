import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import { GENERATION_PREVIEW_FRAME_CLASS, getAspectRatioClass } from '../_lib/aspect-ratio'

type GenerationPreviewFrameProps = {
  aspectRatio?: string
  children?: ReactNode
  className?: string
  isLoading?: boolean
  maxHeightClass?: string
  minHeightClass?: string
  variant?: 'aspect' | 'viewport'
}

export function GenerationPreviewFrame({
  aspectRatio,
  children,
  className,
  isLoading = false,
  maxHeightClass = 'max-h-[min(62dvh,680px)]',
  minHeightClass,
  variant = 'aspect',
}: GenerationPreviewFrameProps) {
  const isViewport = variant === 'viewport'

  return (
    <div
      className={cn(
        GENERATION_PREVIEW_FRAME_CLASS,
        !isViewport && getAspectRatioClass(aspectRatio),
        isViewport && 'flex h-[min(58dvh,640px)] items-center justify-center sm:h-[min(62dvh,680px)]',
        maxHeightClass,
        minHeightClass,
        className,
      )}
    >
      {isLoading ? (
        <>
          <Skeleton className="absolute inset-0 rounded-none" />
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-br from-transparent via-background/5 to-transparent motion-reduce:hidden"
          />
        </>
      ) : null}
      {children}
    </div>
  )
}
