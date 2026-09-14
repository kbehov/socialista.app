'use client'

import { useVideoSave } from '@/hooks/video/use-video-save'
import { useGenerationRun } from '@/hooks/use-generation-run'
import {
  EditorPanelHeader,
  EditorPanelScrollArea,
  EditorPanelSection,
} from '@/components/editor/panel-shell'
import { UgcVoiceDialog } from '@/components/studio/ugc/ugc-voice-dialog'
import { UgcVoiceSettingsDialog } from '@/components/studio/ugc/ugc-voice-settings-dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  beginVideoAudioKickoff,
  clearPendingVideoAudio,
  clearVideoAudioRun,
  endVideoAudioKickoff,
  markVideoAudioPlaced,
  persistPendingVideoAudio,
  persistVideoAudioRun,
  readPendingVideoAudio,
  readVideoAudioRun,
  wasVideoAudioPlaced,
} from '@/lib/video/audio-run-session'
import { HARD_IMPORT_LIMIT } from '@/lib/video/defaults'
import {
  clearPendingAudioScript,
  readPendingAudioScript,
  VIDEO_PRESET_AUDIO_SCRIPT_EVENT,
} from '@/lib/video/editor-events'
import { placeAudioOnTimeline } from '@/lib/video/import-placement'
import { importMediaAsset, importMediaFromLibrary, MediaImportError } from '@/lib/video/media-import'
import { useVideoEditorStore } from '@/lib/video/store'
import { cn } from '@/lib/utils'
import { generateVideoAudio } from '@/services/video.service'
import {
  UGC_DEFAULT_VOICE,
  VIDEO_AUDIO_MAX_CHARS,
  type GenerateAudioOutput,
  type GenerateAudioVoice,
  type UgcClipVoice,
} from '@socialista/types'
import {
  AudioLinesIcon,
  ChevronDownIcon,
  Loader2Icon,
  MicIcon,
  Settings2Icon,
  UploadIcon,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const TERMINAL_FAIL = new Set([
  'FAILED',
  'CRASHED',
  'SYSTEM_FAILURE',
  'CANCELED',
  'CANCELLED',
  'TIMED_OUT',
  'EXPIRED',
  'INTERRUPTED',
])

function toGenerateAudioVoice(voice: UgcClipVoice): GenerateAudioVoice | null {
  const voiceId = voice.voiceId?.trim()
  if (!voiceId) return null
  return {
    voiceId,
    ...(voice.voiceName?.trim() ? { voiceName: voice.voiceName.trim() } : {}),
    ...(typeof voice.speed === 'number' ? { speed: voice.speed } : {}),
    ...(typeof voice.stability === 'number' ? { stability: voice.stability } : {}),
    ...(typeof voice.similarity === 'number' ? { similarity: voice.similarity } : {}),
    ...(typeof voice.style === 'number' ? { style: voice.style } : {}),
    ...(typeof voice.speakerBoost === 'boolean' ? { speakerBoost: voice.speakerBoost } : {}),
  }
}

export function VideoAudioPanel({
  embedded = false,
  showPanelHeader = true,
}: {
  embedded?: boolean
  showPanelHeader?: boolean
}) {
  const { save } = useVideoSave({ autosave: false })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isRunningRef = useRef(false)

  const [text, setText] = useState(() => {
    if (typeof window === 'undefined') return ''
    return readPendingAudioScript()?.slice(0, VIDEO_AUDIO_MAX_CHARS) ?? ''
  })
  const [voice, setVoice] = useState<UgcClipVoice>(UGC_DEFAULT_VOICE)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [runId, setRunId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const videoId = useVideoEditorStore.getState().project.id
    if (!videoId || videoId.startsWith('project_')) return null
    return readVideoAudioRun(videoId)?.runId ?? null
  })
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const videoId = useVideoEditorStore.getState().project.id
    if (!videoId || videoId.startsWith('project_')) return null
    return readVideoAudioRun(videoId)?.accessToken ?? null
  })
  const [consumedRunId, setConsumedRunId] = useState<string | null>(null)
  const [localProgress, setLocalProgress] = useState<number | null>(null)
  const [localLabel, setLocalLabel] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [importing, setImporting] = useState(false)
  const toastedRunIdRef = useRef<string | null>(null)
  const importedRunIdRef = useRef<string | null>(null)
  const restoredRef = useRef(false)
  const mountedRef = useRef(true)

  const { run, error: runHookError } = useGenerationRun({
    runId: runId ?? '',
    accessToken,
  })

  const statusMeta = run?.metadata?.status as { progress?: number; label?: string } | undefined
  const errorMeta = run?.metadata?.error as { message?: string } | undefined
  const progress = typeof statusMeta?.progress === 'number' ? statusMeta.progress : localProgress
  const progressLabel = statusMeta?.label ?? localLabel
  const runFailed = Boolean(run?.status && TERMINAL_FAIL.has(run.status))
  const runCompleted = run?.status === 'COMPLETED'
  const output = runCompleted ? (run?.output as GenerateAudioOutput | undefined) : undefined
  const isRunning = starting || importing || (Boolean(runId) && consumedRunId !== runId)

  if (runId && consumedRunId !== runId && (runFailed || runCompleted)) {
    setConsumedRunId(runId)
    setStarting(false)
    setLocalProgress(null)
    if (runCompleted && output?.audioUrl && !wasVideoAudioPlaced(runId)) {
      setImporting(true)
      setLocalLabel('Adding to timeline')
    } else {
      setImporting(false)
      setLocalLabel(null)
    }
  }

  const used = text.length
  const remaining = Math.max(0, VIDEO_AUDIO_MAX_CHARS - used)
  const trimmed = text.trim()
  const audioVoice = toGenerateAudioVoice(voice)
  const voiceLabel = voice.voiceName?.trim() || 'Choose voice'
  const canGenerate = trimmed.length > 0 && Boolean(audioVoice) && !isRunning
  isRunningRef.current = isRunning

  const persistVideoId = useCallback(() => {
    const videoId = useVideoEditorStore.getState().project.id
    if (!videoId || videoId.startsWith('project_')) return null
    return videoId
  }, [])

  const startAudioRun = useCallback(
    async (script: string, nextVoice: GenerateAudioVoice) => {
      let videoId = persistVideoId()
      if (!videoId) {
        setLocalLabel('Saving draft')
        const saved = await save({ silent: true })
        if (!saved) {
          toast.error('Save your video before generating audio')
          return false
        }
        if (!mountedRef.current) return true
        videoId = persistVideoId()
        if (!videoId) {
          toast.error('Save your video before generating audio')
          return false
        }
      }

      const existing = readVideoAudioRun(videoId)
      if (existing) {
        clearPendingVideoAudio()
        endVideoAudioKickoff()
        if (!mountedRef.current) return true
        setRunId(existing.runId)
        setAccessToken(existing.accessToken)
        setStarting(false)
        setLocalLabel('Generating voiceover')
        return true
      }

      if (!beginVideoAudioKickoff()) return true

      setLocalLabel('Starting voiceover')
      try {
        const response = await generateVideoAudio(videoId, { text: script, voice: nextVoice })
        if (!response.success || !response.data) {
          endVideoAudioKickoff()
          toast.error(response.message ?? 'Failed to start voiceover generation')
          return false
        }

        persistVideoAudioRun(videoId, response.data.runId, response.data.publicAccessToken)
        clearPendingVideoAudio()
        endVideoAudioKickoff()
        if (!mountedRef.current) return true
        setRunId(response.data.runId)
        setAccessToken(response.data.publicAccessToken)
        setStarting(false)
        setLocalProgress(5)
        setLocalLabel('Queued')
        return true
      } catch (error) {
        endVideoAudioKickoff()
        throw error
      }
    },
    [persistVideoId, save],
  )

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const applyPresetScript = useCallback((value: string) => {
    const next = value.slice(0, VIDEO_AUDIO_MAX_CHARS)
    if (!next.trim()) return

    if (isRunningRef.current) {
      const el = textareaRef.current
      const visible = Boolean(
        el && (typeof el.checkVisibility !== 'function' || el.checkVisibility()),
      )
      if (visible) toast.error('Wait for the current voiceover to finish')
      return
    }

    clearPendingAudioScript()
    setText(next)
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      if (typeof el.checkVisibility === 'function' && !el.checkVisibility()) return
      el.focus()
      el.setSelectionRange(next.length, next.length)
    })
  }, [])

  useEffect(() => {
    const pending = readPendingAudioScript()
    if (pending) applyPresetScript(pending)

    const onPreset = (event: Event) => {
      const detail = (event as CustomEvent).detail
      if (typeof detail !== 'string') return
      applyPresetScript(detail)
    }
    window.addEventListener(VIDEO_PRESET_AUDIO_SCRIPT_EVENT, onPreset)
    return () => window.removeEventListener(VIDEO_PRESET_AUDIO_SCRIPT_EVENT, onPreset)
  }, [applyPresetScript])

  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    if (runId) return

    const videoId = persistVideoId()
    if (!videoId) return
    const pending = readPendingVideoAudio()
    if (!pending) return

    queueMicrotask(() => {
      setStarting(true)
      setLocalProgress(2)
      setLocalLabel('Starting voiceover')
      void startAudioRun(pending.text, pending.voice).then(ok => {
        if (ok || !mountedRef.current) return
        clearPendingVideoAudio()
        setStarting(false)
        setLocalProgress(null)
        setLocalLabel(null)
      })
    })
  }, [persistVideoId, runId, startAudioRun])

  useEffect(() => {
    if (!runId || consumedRunId !== runId) return

    if (runFailed && toastedRunIdRef.current !== runId) {
      toastedRunIdRef.current = runId
      const videoId = persistVideoId()
      if (videoId) clearVideoAudioRun(videoId)
      clearPendingVideoAudio()
      toast.error(
        errorMeta?.message ??
          (runHookError instanceof Error ? runHookError.message : null) ??
          'Voiceover generation failed',
      )
      return
    }

    if (!runCompleted || importedRunIdRef.current === runId) return
    importedRunIdRef.current = runId

    if (wasVideoAudioPlaced(runId)) {
      const videoId = persistVideoId()
      if (videoId) clearVideoAudioRun(videoId)
      return
    }

    if (!output?.audioUrl) {
      if (toastedRunIdRef.current !== runId) {
        toastedRunIdRef.current = runId
        toast.error('No audio was returned')
      }
      return
    }

    void importMediaFromLibrary({ url: output.audioUrl, name: 'Voiceover.mp3' }, { forceType: 'audio' })
      .then(async asset => {
        const placed = placeAudioOnTimeline(asset)
        if (!placed) return
        markVideoAudioPlaced(runId)
        const videoId = persistVideoId()
        if (videoId) clearVideoAudioRun(videoId)
        await save({ silent: true })
      })
      .catch(err => {
        toast.error(err instanceof MediaImportError ? err.message : 'Failed to add voiceover to the timeline')
      })
      .finally(() => {
        setImporting(false)
        setLocalLabel(null)
      })
  }, [
    consumedRunId,
    errorMeta?.message,
    output?.audioUrl,
    persistVideoId,
    runCompleted,
    runFailed,
    runHookError,
    runId,
    save,
  ])

  const resetRunUi = useCallback(() => {
    toastedRunIdRef.current = null
    importedRunIdRef.current = null
    setRunId(null)
    setAccessToken(null)
    setConsumedRunId(null)
    setLocalProgress(null)
    setLocalLabel(null)
    setStarting(false)
    setImporting(false)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (starting || isRunning) return
    if (!trimmed) {
      toast.error('Write a script before generating audio')
      return
    }
    if (!audioVoice) {
      toast.error('Pick a voice first')
      return
    }

    toastedRunIdRef.current = null
    importedRunIdRef.current = null
    setConsumedRunId(null)
    setStarting(true)
    setLocalProgress(2)
    setLocalLabel('Saving draft')
    setRunId(null)
    setAccessToken(null)
    persistPendingVideoAudio({ text: trimmed, voice: audioVoice })

    try {
      const ok = await startAudioRun(trimmed, audioVoice)
      if (!mountedRef.current) return
      if (!ok) {
        clearPendingVideoAudio()
        resetRunUi()
      }
    } catch (err) {
      if (!mountedRef.current) return
      clearPendingVideoAudio()
      toast.error(err instanceof Error ? err.message : 'Failed to generate audio')
      resetRunUi()
    }
  }, [audioVoice, isRunning, resetRunUi, startAudioRun, starting, trimmed])

  const handleUpload = useCallback(
    async (files: FileList | File[] | null) => {
      if (!files || isRunning) return
      setImporting(true)
      try {
        for (const file of Array.from(files)) {
          if (!file.type.startsWith('audio/')) {
            toast.error(`${file.name} is not an audio file`)
            continue
          }
          if (file.size > HARD_IMPORT_LIMIT) {
            toast.error(`${file.name} exceeds the 500MB import limit`)
            continue
          }
          const asset = await importMediaAsset(file)
          placeAudioOnTimeline(asset)
        }
      } catch (err) {
        toast.error(err instanceof MediaImportError ? err.message : 'Failed to import audio')
      } finally {
        setImporting(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    },
    [isRunning],
  )

  const percent = progress != null ? Math.round(progress) : 0

  return (
    <aside
      className={
        embedded
          ? 'flex h-full min-h-0 flex-col overflow-hidden'
          : 'flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm'
      }
    >
      {showPanelHeader ? (
        <div className="shrink-0 border-b border-border/40 px-3.5 py-2.5">
          <EditorPanelHeader
            title="Audio"
            description="Generate a voiceover or upload your own"
          />
        </div>
      ) : null}

      <EditorPanelScrollArea contentClassName="gap-5 p-3.5 pb-4">
        <EditorPanelSection
          title="Voiceover"
          description="ElevenLabs reads your script and drops it on an audio track at the playhead"
        >
          <div className="relative">
            <Textarea
              ref={textareaRef}
              id="video-audio-script"
              placeholder="Hey — wait until you try this…"
              value={text}
              maxLength={VIDEO_AUDIO_MAX_CHARS}
              rows={6}
              disabled={isRunning}
              onChange={e => setText(e.target.value.slice(0, VIDEO_AUDIO_MAX_CHARS))}
              className={cn(
                'min-h-32 resize-none rounded-xl border-border/50 bg-muted/10 px-3 pt-2.5 pb-7 text-[13px] leading-relaxed shadow-none',
                'placeholder:text-muted-foreground/55',
                'focus-visible:border-ring/60 focus-visible:bg-background focus-visible:ring-2',
                'transition-[background-color,border-color,box-shadow] duration-150',
              )}
              onKeyDown={e => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault()
                  if (canGenerate) void handleGenerate()
                }
              }}
            />
            <span
              className={cn(
                'pointer-events-none absolute right-2.5 bottom-2 text-[10px] tabular-nums tracking-tight',
                remaining <= 0
                  ? 'text-destructive'
                  : remaining <= 40
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-muted-foreground/50',
              )}
            >
              {used}/{VIDEO_AUDIO_MAX_CHARS}
            </span>
          </div>

          <div className="flex gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isRunning}
              className="h-8 min-w-0 flex-1 justify-start gap-1.5 rounded-lg px-2 text-[12px] font-medium"
              onClick={() => setVoiceOpen(true)}
            >
              <MicIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{voiceLabel}</span>
              <ChevronDownIcon className="ml-auto size-3 shrink-0 opacity-45" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={isRunning}
              className="size-8 shrink-0 rounded-lg"
              onClick={() => setSettingsOpen(true)}
              aria-label="Voice settings"
            >
              <Settings2Icon className="size-3.5" strokeWidth={1.75} />
            </Button>
          </div>
        </EditorPanelSection>

        <EditorPanelSection title="Upload" description="Drop your own voiceover on the timeline">
          <button
            type="button"
            disabled={isRunning}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left',
              'transition-colors duration-150',
              'hover:bg-foreground/[0.04] active:scale-[0.99]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/40">
              {importing && !starting && !runId ? (
                <Loader2Icon className="size-3.5 animate-spin text-foreground/75" />
              ) : (
                <UploadIcon className="size-3.5 text-foreground/75" strokeWidth={1.75} />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-medium tracking-tight text-foreground">Upload audio</span>
              <span className="mt-0.5 block text-[11px] leading-[1.35] text-muted-foreground">
                MP3, WAV, or M4A from your device
              </span>
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={e => {
              void handleUpload(e.target.files)
            }}
          />
        </EditorPanelSection>
      </EditorPanelScrollArea>

      <div className="shrink-0 space-y-2 border-t border-border/40 bg-background/80 p-3.5 backdrop-blur-sm">
        {isRunning && (starting || Boolean(runId)) ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[12px]">
              <Loader2Icon className="size-3.5 animate-spin" strokeWidth={2} />
              <span>{progressLabel ?? 'Working…'}</span>
              <span className="ml-auto font-mono tabular-nums text-muted-foreground">{percent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
            </div>
          </div>
        ) : (
          <Button
            className="h-9 w-full gap-2 rounded-lg text-[12px] font-medium tracking-tight shadow-xs"
            onClick={() => void handleGenerate()}
            disabled={!canGenerate}
          >
            <AudioLinesIcon className="size-3.5" strokeWidth={2} />
            Generate audio
          </Button>
        )}
      </div>

      <UgcVoiceDialog open={voiceOpen} value={voice} onOpenChange={setVoiceOpen} onSelect={setVoice} />
      <UgcVoiceSettingsDialog
        key={voice.voiceId ?? 'default'}
        open={settingsOpen}
        value={voice}
        disabled={isRunning}
        onOpenChange={setSettingsOpen}
        onChange={setVoice}
      />
    </aside>
  )
}
