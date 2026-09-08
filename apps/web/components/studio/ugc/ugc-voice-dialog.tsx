'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { getUgcVoices } from '@/services/ugc-project.service'
import {
  UGC_VOICE_ACCENTS,
  UGC_VOICE_AGES,
  UGC_VOICE_GENDERS,
  UGC_VOICE_LANGUAGES,
  type SearchUgcVoicesQuery,
  type UgcClipVoice,
  type UgcVoice,
} from '@socialista/types'
import { Loader2Icon, PauseIcon, PlayIcon, SearchIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type UgcVoiceDialogProps = {
  open: boolean
  value?: UgcClipVoice
  onOpenChange: (open: boolean) => void
  onSelect: (voice: UgcClipVoice) => void
}

const ALL = '__all__'

const LANGUAGE_LABELS = Object.fromEntries(UGC_VOICE_LANGUAGES.map(item => [item.id, item.label]))

export function UgcVoiceDialog({ open, value, onOpenChange, onSelect }: UgcVoiceDialogProps) {
  const [search, setSearch] = useState('')
  const [language, setLanguage] = useState(ALL)
  const [gender, setGender] = useState(ALL)
  const [age, setAge] = useState(ALL)
  const [accent, setAccent] = useState(ALL)
  const [voices, setVoices] = useState<UgcVoice[]>([])
  const [loading, setLoading] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return

    const run = (query: SearchUgcVoicesQuery) => {
      setLoading(true)
      void getUgcVoices(query).then(response => {
        setLoading(false)
        if (response.success && response.data?.voices) {
          setVoices(response.data.voices)
        }
      })
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      run({
        search: search.trim() || undefined,
        language: language === ALL ? undefined : language,
        gender: gender === ALL ? undefined : gender,
        age: age === ALL ? undefined : age,
        accent: accent === ALL ? undefined : accent,
      })
    }, 280)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [accent, age, gender, language, open, search])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  const togglePreview = (voice: UgcVoice) => {
    if (!voice.previewUrl) return
    if (playingId === voice.id) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }
    audioRef.current?.pause()
    const audio = new Audio(voice.previewUrl)
    audioRef.current = audio
    audio.onended = () => setPlayingId(null)
    void audio.play().then(() => setPlayingId(voice.id)).catch(() => setPlayingId(null))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) {
          audioRef.current?.pause()
          setPlayingId(null)
        }
        onOpenChange(next)
      }}
    >
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a voice</DialogTitle>
          <DialogDescription>
            Filter ElevenLabs voices and preview the real sample before you generate audio.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search voices…"
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterSelect label="Language" value={language} onChange={setLanguage} options={UGC_VOICE_LANGUAGES} />
          <FilterSelect
            label="Gender"
            value={gender}
            onChange={setGender}
            options={UGC_VOICE_GENDERS.map(id => ({ id, label: id }))}
          />
          <FilterSelect
            label="Age"
            value={age}
            onChange={setAge}
            options={UGC_VOICE_AGES.map(id => ({ id, label: id.replace('_', ' ') }))}
          />
          <FilterSelect label="Accent" value={accent} onChange={setAccent} options={UGC_VOICE_ACCENTS} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {loading && voices.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2Icon className="size-5 animate-spin" />
            </div>
          ) : voices.length === 0 ? (
            <p className="py-12 text-center text-[13px] text-muted-foreground">No voices match these filters.</p>
          ) : (
            <ul className="grid gap-1.5">
              {voices.map(voice => {
                const selected = voice.id === value?.voiceId
                return (
                  <li key={voice.id}>
                    <div
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-2 py-2 ring-1 transition',
                        selected ? 'bg-muted/60 ring-foreground/20' : 'ring-transparent hover:bg-muted/40',
                      )}
                    >
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="outline"
                        disabled={!voice.previewUrl}
                        aria-label={playingId === voice.id ? `Pause ${voice.name}` : `Preview ${voice.name}`}
                        onClick={() => togglePreview(voice)}
                      >
                        {playingId === voice.id ? <PauseIcon className="size-3.5" /> : <PlayIcon className="size-3.5" />}
                      </Button>
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => {
                          onSelect({
                            ...value,
                            provider: 'elevenlabs',
                            voiceId: voice.id,
                            voiceName: voice.name,
                            enabled: true,
                          })
                          onOpenChange(false)
                        }}
                      >
                        <p className="truncate text-[13px] font-medium">{voice.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {[
                            voice.labels.language
                              ? (LANGUAGE_LABELS[voice.labels.language] ?? voice.labels.language)
                              : undefined,
                            voice.labels.gender,
                            voice.labels.accent,
                            voice.labels.age,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </button>
                      {selected ? (
                        <span className="text-[10px] font-medium text-muted-foreground">Selected</span>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: ReadonlyArray<{ id: string; label: string } | string>
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" className="min-w-28">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>Any {label.toLowerCase()}</SelectItem>
        {options.map(option => {
          const id = typeof option === 'string' ? option : option.id
          const itemLabel = typeof option === 'string' ? option : option.label
          return (
            <SelectItem key={id} value={id}>
              {itemLabel}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
