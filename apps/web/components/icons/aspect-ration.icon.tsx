import { cn } from '@/lib/utils'
type AspectRatioIconProps = {
  ratio: number
  active?: boolean
}
export function AspectRatioIcon({ ratio, active }: AspectRatioIconProps) {
  const maxSize = 11
  const width = ratio >= 1 ? maxSize : maxSize * ratio
  const height = ratio >= 1 ? maxSize / ratio : maxSize

  return (
    <span aria-hidden className="inline-flex size-3.5 items-center justify-center">
      <span
        className={cn(
          'rounded-[2px] border transition-colors duration-150',
          active ? 'border-foreground/80 bg-foreground/10' : 'border-current/55',
        )}
        style={{ width, height }}
      />
    </span>
  )
}
