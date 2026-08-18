'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { UGC_VOICES } from '@/lib/studio/ugc/voices'
import { cn } from '@/lib/utils'
import type { UgcClipVoice } from '@socialista/types'
import { PauseIcon, PlayIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type VoicePickerProps = {
  value?: UgcClipVoice
  disabled?: boolean
  onChange: (voice: UgcClipVoice) => void
}

export function VoicePicker({ value, disabled, onChange }: VoicePickerProps) {
  const selectedId = value?.voiceId ?? UGC_VOICES[0]?.id
  const selected = UGC_VOICES.find(voice => voice.id === selectedId) ?? UGC_VOICES[0]
  const enabled = value?.enabled !== false
  const speed = value?.speed ?? 1
  const stability = value?.stability ?? 50
  const [playing, setPlaying] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [])

  if (!selected) return null

  const patch = (next: Partial<UgcClipVoice>) => {
    onChange({
      provider: 'elevenlabs',
      voiceId: selected.id,
      voiceName: selected.name,
      speed,
      stability,
      enabled,
      ...value,
      ...next,
    })
  }

  const togglePreview = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    if (playing) {
      window.speechSynthesis.cancel()
      setPlaying(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(
      'Hey, this is how I sound on camera. Wait until the drop.',
    )
    utterance.rate = speed
    utterance.onend = () => setPlaying(false)
    utteranceRef.current = utterance
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setPlaying(true)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium tracking-tight">Voiceover</p>
          <p className="text-[11px] text-muted-foreground">
            Spoken audio is coming soon. Settings save with the clip.
          </p>
        </div>
        <Switch
          checked={enabled}
          disabled={disabled}
          onCheckedChange={checked => patch({ enabled: checked })}
          aria-label="Enable voiceover"
        />
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {UGC_VOICES.map(voice => {
          const active = voice.id === selected.id
          return (
            <button
              key={voice.id}
              type="button"
              disabled={disabled || !enabled}
              onClick={() => patch({ voiceId: voice.id, voiceName: voice.name })}
              className={cn(
                'rounded-xl border px-2.5 py-2 text-left transition active:scale-[0.98] disabled:opacity-50',
                active
                  ? 'border-foreground/30 bg-background shadow-sm ring-1 ring-foreground/10'
                  : 'border-border/60 bg-background/60 hover:border-border',
              )}
            >
              <p className="text-[12px] font-medium tracking-tight">{voice.name}</p>
              <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                {voice.description}
              </p>
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7"
          disabled={disabled || !enabled}
          onClick={togglePreview}
        >
          {playing ? <PauseIcon className="size-3.5" /> : <PlayIcon className="size-3.5" />}
          Preview
        </Button>
        <label className="flex min-w-36 flex-1 items-center gap-2 text-[11px] text-muted-foreground">
          Speed
          <Slider
            min={0.7}
            max={1.2}
            step={0.05}
            value={[speed]}
            disabled={disabled || !enabled}
            onValueChange={([next]) => {
              if (typeof next === 'number') patch({ speed: next })
            }}
          />
          <span className="w-8 tabular-nums text-foreground">{speed.toFixed(2)}</span>
        </label>
        <label className="flex min-w-36 flex-1 items-center gap-2 text-[11px] text-muted-foreground">
          Stability
          <Slider
            min={0}
            max={100}
            step={1}
            value={[stability]}
            disabled={disabled || !enabled}
            onValueChange={([next]) => {
              if (typeof next === 'number') patch({ stability: next })
            }}
          />
          <span className="w-8 tabular-nums text-foreground">{Math.round(stability)}</span>
        </label>
      </div>
    </div>
  )
}
