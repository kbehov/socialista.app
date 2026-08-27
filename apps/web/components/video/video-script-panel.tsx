'use client'

import { generateVideoScriptAction } from '@/actions/video.actions'
import { StudioSkillPicker } from '@/components/skills/studio-skill-picker'
import {
  EditorPanelHeader,
  EditorPanelScrollArea,
  EditorPanelSection,
} from '@/components/editor/panel-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { SCRIPT_ROLE_OVERLAY_PRESETS } from '@/lib/video/defaults'
import { useVideoEditorStore } from '@/lib/video/store'
import { formatTimecode } from '@/lib/video/timecode'
import { cn } from '@/lib/utils'
import type { VideoScriptSegment, VideoScriptTone } from '@socialista/types'
import { PROMPT_KEYS, VIDEO_SCRIPT_TONES } from '@socialista/types'
import {
  ArrowLeftIcon,
  Loader2Icon,
  SparklesIcon,
} from 'lucide-react'
import { useCallback, useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

const GENERATION_COST_USD = 0.02
const PROMPT_MAX_LENGTH = 800
const MIN_DURATION = 5
const MAX_DURATION = 600
const DEFAULT_EMPTY_DURATION = 30

const PROMPT_EXAMPLES = [
  {
    label: 'Tips',
    prompt: '5 tips for growing on TikTok without posting every day — punchy on-screen captions',
  },
  {
    label: 'Product',
    prompt: '15-second product launch teaser for a new skincare serum — hook, benefits, CTA to shop',
  },
  {
    label: 'Myth',
    prompt: 'Bust the myth that you need expensive gear to create viral short-form video',
  },
] as const

const TONE_LABELS: Record<VideoScriptTone, string> = {
  casual: 'Casual',
  educational: 'Educational',
  hype: 'Hype',
  professional: 'Professional',
}

type PanelView = 'input' | 'preview'

function formatDurationShort(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function roleBadgeClass(role: VideoScriptSegment['role']): string {
  if (role === 'hook') return 'bg-violet-500/15 text-violet-700 dark:text-violet-300'
  if (role === 'cta') return 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
  return 'bg-foreground/6 text-muted-foreground'
}

export function VideoScriptPanel({
  embedded = false,
  showPanelHeader = true,
}: {
  embedded?: boolean
  showPanelHeader?: boolean
}) {
  const projectDuration = useVideoEditorStore(s => s.project.duration)
  const fps = useVideoEditorStore(s => s.project.fps)
  const addTextOverlays = useVideoEditorStore(s => s.addTextOverlays)
  const seek = useVideoEditorStore(s => s.seek)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [view, setView] = useState<PanelView>('input')
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState<VideoScriptTone>('casual')
  const [manualDuration, setManualDuration] = useState(DEFAULT_EMPTY_DURATION)
  const [title, setTitle] = useState('')
  const [segments, setSegments] = useState<VideoScriptSegment[]>([])
  const [replaceExisting, setReplaceExisting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [skillId, setSkillId] = useState<string | undefined>()

  const hasTimeline = projectDuration > 0
  const effectiveDuration = hasTimeline
    ? projectDuration
    : Math.min(MAX_DURATION, Math.max(MIN_DURATION, manualDuration))

  const trimmed = prompt.trim()
  const canGenerate = trimmed.length > 0 && !isPending
  const charCount = prompt.length

  const handleGenerate = useCallback(() => {
    if (!trimmed) {
      toast.error('Enter a description of your video first')
      textareaRef.current?.focus()
      return
    }

    startTransition(async () => {
      const result = await generateVideoScriptAction(trimmed, effectiveDuration, tone, skillId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setTitle(result.title)
      setSegments(result.segments)
      setView('preview')
      toast.success(`Generated ${result.segments.length} captions`)
    })
  }, [effectiveDuration, skillId, tone, trimmed])

  const updateSegment = useCallback((index: number, partial: Partial<VideoScriptSegment>) => {
    setSegments(prev =>
      prev.map((segment, i) => (i === index ? { ...segment, ...partial } : segment)),
    )
  }, [])

  const handleApply = useCallback(() => {
    if (segments.length === 0) {
      toast.error('Nothing to apply')
      return
    }

    const batch = segments.map(segment => {
      const preset = SCRIPT_ROLE_OVERLAY_PRESETS[segment.role]
      return {
        content: segment.text,
        startTime: segment.startTime,
        endTime: segment.endTime,
        x: preset.x,
        y: preset.y,
        width: preset.width,
        style: preset.style,
      }
    })

    const ids = addTextOverlays(batch, { replaceExisting })
    const first = segments[0]
    if (first) seek(first.startTime)

    toast.success(
      replaceExisting
        ? `Replaced timeline text with ${ids.length} overlay${ids.length === 1 ? '' : 's'}`
        : `Applied ${ids.length} text overlay${ids.length === 1 ? '' : 's'}`,
    )
  }, [addTextOverlays, replaceExisting, seek, segments])

  const applyExample = (example: (typeof PROMPT_EXAMPLES)[number]) => {
    setPrompt(example.prompt)
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(example.prompt.length, example.prompt.length)
    })
  }

  const durationHint = useMemo(() => {
    if (hasTimeline) return `Fit to current video (${formatDurationShort(projectDuration)})`
    return 'No clips yet — set a target length'
  }, [hasTimeline, projectDuration])

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
            title="Script"
            description="Generate timed on-screen captions"
          />
        </div>
      ) : null}

      {view === 'input' ? (
        <>
          <EditorPanelScrollArea contentClassName="gap-5 p-3.5 pb-4">
            <EditorPanelSection
              title="Describe the video"
              description="What should appear on screen? Topic, beats, and CTA all work."
            >
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  id="video-script-prompt"
                  placeholder='e.g. Product launch teaser — hook on the problem, 3 benefits, CTA to shop…'
                  value={prompt}
                  onChange={e => setPrompt(e.target.value.slice(0, PROMPT_MAX_LENGTH))}
                  rows={5}
                  disabled={isPending}
                  className={cn(
                    'min-h-30 resize-none rounded-xl border-border/50 bg-muted/10 px-3 pt-2.5 pb-7 text-[13px] leading-relaxed shadow-none',
                    'placeholder:text-muted-foreground/55',
                    'focus-visible:border-ring/60 focus-visible:bg-background focus-visible:ring-2',
                    'transition-[background-color,border-color,box-shadow] duration-150',
                  )}
                  onKeyDown={e => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault()
                      if (canGenerate) handleGenerate()
                    }
                  }}
                />
                <div className="pointer-events-none absolute right-2.5 bottom-2 flex items-center gap-1.5">
                  <span
                    className={cn(
                      'text-[10px] tabular-nums tracking-tight',
                      charCount > PROMPT_MAX_LENGTH * 0.9
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/50',
                    )}
                  >
                    {charCount > 0 ? `${charCount}` : null}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5" role="list" aria-label="Example prompts">
                {PROMPT_EXAMPLES.map(example => {
                  const active = prompt === example.prompt
                  return (
                    <button
                      key={example.label}
                      type="button"
                      role="listitem"
                      disabled={isPending}
                      onClick={() => applyExample(example)}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[11px] tracking-tight transition-all duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                        'disabled:pointer-events-none disabled:opacity-50',
                        'active:scale-[0.97]',
                        active
                          ? 'border-foreground/15 bg-foreground/6 font-medium text-foreground'
                          : 'border-border/50 bg-muted/15 text-muted-foreground hover:border-border hover:bg-muted/35 hover:text-foreground',
                      )}
                    >
                      {example.label}
                    </button>
                  )
                })}
              </div>
            </EditorPanelSection>

            <EditorPanelSection title="Tone">
              <div
                className="flex flex-wrap gap-1 rounded-xl border border-border/40 bg-muted/10 p-1.5"
                role="radiogroup"
                aria-label="Script tone"
              >
                {VIDEO_SCRIPT_TONES.map(value => {
                  const selected = tone === value
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={isPending}
                      onClick={() => setTone(value)}
                      className={cn(
                        'h-7 flex-1 rounded-md px-1.5 text-[11px] tracking-tight transition-all duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                        'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
                        selected
                          ? 'bg-foreground/8 font-semibold text-foreground'
                          : 'font-medium text-muted-foreground hover:bg-foreground/4 hover:text-foreground',
                      )}
                    >
                      {TONE_LABELS[value]}
                    </button>
                  )
                })}
              </div>
            </EditorPanelSection>

            <EditorPanelSection title="Duration" description={durationHint}>
              {hasTimeline ? (
                <div className="rounded-xl border border-border/40 bg-muted/10 px-3 py-2.5">
                  <p className="text-[13px] font-semibold tabular-nums tracking-tight text-foreground">
                    {formatDurationShort(projectDuration)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Captions will be timed to your timeline
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={MIN_DURATION}
                    max={MAX_DURATION}
                    step={1}
                    value={manualDuration}
                    disabled={isPending}
                    onChange={e => {
                      const next = Number(e.target.value)
                      if (!Number.isFinite(next)) return
                      setManualDuration(next)
                    }}
                    className="h-9 w-24 tabular-nums"
                    aria-label="Target duration in seconds"
                  />
                  <span className="text-[11px] text-muted-foreground">seconds</span>
                </div>
              )}
            </EditorPanelSection>
          </EditorPanelScrollArea>

          <div className="shrink-0 space-y-2 border-t border-border/40 bg-background/80 p-3.5 backdrop-blur-sm">
            <StudioSkillPicker
              target={PROMPT_KEYS.videoScript}
              value={skillId}
              onChange={setSkillId}
              disabled={isPending}
            />
            <Button
              className="h-9 w-full gap-2 rounded-lg text-[12px] font-medium tracking-tight shadow-xs"
              onClick={handleGenerate}
              disabled={!canGenerate}
            >
              {isPending ? (
                <Loader2Icon className="size-3.5 animate-spin" strokeWidth={2} />
              ) : (
                <SparklesIcon className="size-3.5" strokeWidth={2} />
              )}
              {isPending ? 'Generating…' : 'Generate script'}
            </Button>
            <div className="flex items-center justify-between gap-2 px-0.5 text-[10px] tracking-wide text-muted-foreground/75">
              <p>≈ ${GENERATION_COST_USD.toFixed(2)} per generation</p>
              <p className="flex items-center gap-1">
                <Kbd className="h-4 min-w-4 px-1 text-[10px]">⌘</Kbd>
                <Kbd className="h-4 min-w-4 px-1 text-[10px]">↵</Kbd>
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="shrink-0 border-b border-border/40 px-3 py-2">
            <button
              type="button"
              onClick={() => setView('input')}
              className="flex items-center gap-1.5 rounded-md px-1 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <ArrowLeftIcon className="size-3" strokeWidth={2} />
              Back
            </button>
            <p className="mt-1 truncate px-1 text-[13px] font-semibold tracking-tight text-foreground">
              {title || 'Generated script'}
            </p>
            <p className="px-1 text-[11px] text-muted-foreground">
              {segments.length} caption{segments.length === 1 ? '' : 's'} · edit before applying
            </p>
          </div>

          <EditorPanelScrollArea contentClassName="gap-2.5 p-3 pb-4">
            {segments.map((segment, index) => (
              <div
                key={`${segment.role}-${index}`}
                className="rounded-xl border border-border/40 bg-muted/10 p-2.5"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      roleBadgeClass(segment.role),
                    )}
                  >
                    {segment.role}
                  </span>
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {formatTimecode(segment.startTime, fps)} – {formatTimecode(segment.endTime, fps)}
                  </span>
                </div>
                <Textarea
                  value={segment.text}
                  rows={2}
                  onChange={e => updateSegment(index, { text: e.target.value })}
                  className="min-h-0 resize-none rounded-lg border-border/40 bg-background/80 px-2.5 py-2 text-[12px] leading-snug shadow-none"
                />
                <div className="mt-2 flex items-center gap-2">
                  <Label className="sr-only" htmlFor={`script-start-${index}`}>
                    Start time
                  </Label>
                  <Input
                    id={`script-start-${index}`}
                    type="number"
                    min={0}
                    step={0.1}
                    value={segment.startTime}
                    onChange={e => {
                      const next = Number(e.target.value)
                      if (!Number.isFinite(next)) return
                      updateSegment(index, { startTime: Math.max(0, next) })
                    }}
                    className="h-7 w-18 px-2 text-[11px] tabular-nums"
                    aria-label={`Segment ${index + 1} start seconds`}
                  />
                  <span className="text-[10px] text-muted-foreground">→</span>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={segment.endTime}
                    onChange={e => {
                      const next = Number(e.target.value)
                      if (!Number.isFinite(next)) return
                      updateSegment(index, { endTime: Math.max(0, next) })
                    }}
                    className="h-7 w-18 px-2 text-[11px] tabular-nums"
                    aria-label={`Segment ${index + 1} end seconds`}
                  />
                  <span className="text-[10px] text-muted-foreground">s</span>
                </div>
              </div>
            ))}
          </EditorPanelScrollArea>

          <div className="shrink-0 space-y-2.5 border-t border-border/40 bg-background/80 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2 px-0.5">
              <Label
                htmlFor="replace-overlays"
                className="text-[11px] leading-snug font-normal text-muted-foreground"
              >
                Replace existing text overlays
              </Label>
              <Switch
                id="replace-overlays"
                size="sm"
                checked={replaceExisting}
                onCheckedChange={setReplaceExisting}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-9 flex-1 rounded-lg text-[12px] font-medium"
                disabled={isPending}
                onClick={handleGenerate}
              >
                {isPending ? (
                  <Loader2Icon className="size-3.5 animate-spin" strokeWidth={2} />
                ) : null}
                Regenerate
              </Button>
              <Button
                className="h-9 flex-1 rounded-lg text-[12px] font-medium shadow-xs"
                onClick={handleApply}
                disabled={segments.length === 0}
              >
                Apply to timeline
              </Button>
            </div>
          </div>
        </>
      )}
    </aside>
  )
}
