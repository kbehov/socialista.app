'use client'

type InspectorSliderProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  onCommit?: (value: number) => void
  format?: (value: number) => string
  className?: string
}

export function InspectorSlider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  onCommit,
  format,
  className,
}: InspectorSliderProps) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ''}`}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono tabular-nums">{format ? format(value) : value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        onPointerUp={e => onCommit?.(parseFloat((e.target as HTMLInputElement).value))}
        onKeyUp={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            onCommit?.(parseFloat((e.target as HTMLInputElement).value))
          }
        }}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
    </label>
  )
}
