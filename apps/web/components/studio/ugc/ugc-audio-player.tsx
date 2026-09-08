'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import type { UgcClipAudioTake } from '@socialista/types'
import { CheckIcon, PauseIcon, PlayIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

type UgcAudioPlayerProps = {
  src: string
  durationSec?: number
  disabled?: boolean
  label?: string
  className?: string
}

function formatTime(seconds: number) {
  const clamped = Math.max(0, seconds)
  const mins = Math.floor(clamped / 60)
  const secs = Math.floor(clamped % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

export function UgcAudioPlayer({
  src,
  durationSec,
  disabled,
  label,
  className,
}: UgcAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(durationSec ?? 0)

  useEffect(() => {
    setPlaying(false)
    setCurrent(0)
    setDuration(durationSec ?? 0)
  }, [src, durationSec])

  useEffect(() => {
    const node = audioRef.current
    if (!node) return
    const onTime = () => setCurrent(node.currentTime)
    const onMeta = () => {
      if (Number.isFinite(node.duration)) setDuration(node.duration)
    }
    const onEnded = () => setPlaying(false)
    node.addEventListener('timeupdate', onTime)
    node.addEventListener('loadedmetadata', onMeta)
    node.addEventListener('ended', onEnded)
    return () => {
      node.removeEventListener('timeupdate', onTime)
      node.removeEventListener('loadedmetadata', onMeta)
      node.removeEventListener('ended', onEnded)
    }
  }, [src])

  const toggle = () => {
    const node = audioRef.current
    if (!node || disabled) return
    if (playing) {
      node.pause()
      setPlaying(false)
      return
    }
    void node.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }

  const max = Math.max(duration, 0.1)
  const currentValue = useMemo(() => [current], [current])

  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? <p className="text-[11px] text-muted-foreground">{label}</p> : null}
      <div className="flex items-center gap-2.5">
        <audio ref={audioRef} src={src} preload="metadata" />
        <Button
          type="button"
          size="icon-xs"
          variant="outline"
          disabled={disabled}
          aria-label={playing ? 'Pause voiceover' : 'Play voiceover'}
          onClick={toggle}
          className="size-8 shrink-0 rounded-full"
        >
          {playing ? <PauseIcon className="size-3.5" /> : <PlayIcon className="size-3.5 fill-current" />}
        </Button>
        <div className="min-w-0 flex-1 space-y-1">
          <Slider
            min={0}
            max={max}
            step={0.1}
            value={currentValue}
            disabled={disabled}
            onValueChange={([next]) => {
              if (typeof next !== 'number' || next === current) return
              const node = audioRef.current
              if (node) node.currentTime = next
              setCurrent(next)
            }}
            className="w-full"
          />
          <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
            <span>{formatTime(current)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

type UgcAudioTakesProps = {
  takes: UgcClipAudioTake[]
  selectedUrl?: string
  disabled?: boolean
  onSelect?: (url: string) => void
}

export function UgcAudioTakes({
  takes,
  selectedUrl,
  disabled,
  onSelect,
}: UgcAudioTakesProps) {
  return (
    <div className="space-y-2">
      <p className="text-[12px] text-muted-foreground">
        {takes.length === 1 ? '1 voiceover' : `${takes.length} voiceovers`}
      </p>
      {takes.map((take, index) => {
        const active = take.audioUrl === selectedUrl
        const quote = take.scriptText?.trim()
        return (
          <div
            key={take.id}
            className={cn(
              'space-y-2 rounded-xl px-3 py-2.5',
              active ? 'bg-muted/50' : 'bg-muted/25',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground">
                {active ? 'Selected' : index === 0 ? 'Latest' : `Version ${takes.length - index}`}
              </p>
              {active ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                  <CheckIcon className="size-3" strokeWidth={2.5} />
                </span>
              ) : onSelect ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[12px]"
                  disabled={disabled}
                  onClick={() => onSelect(take.audioUrl)}
                >
                  Use
                </Button>
              ) : null}
            </div>
            {quote ? <p className="text-[13px] leading-relaxed text-foreground/90">“{quote}”</p> : null}
            <UgcAudioPlayer src={take.audioUrl} durationSec={take.durationSec} disabled={disabled} />
          </div>
        )
      })}
    </div>
  )
}
