'use client'

import { VideoPromptInput, type VideoPromptSubmitResult } from '@/components/studio/videos/video-prompt-input'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '@/components/ui/carousel'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useGenerationRun } from '@/hooks/use-generation-run'
import { storeGenerationAccessToken } from '@/lib/image-generation/session'
import { INFLUENCER_HOOK_FORMATS } from '@/lib/studio/influencers/presets'
import { cn } from '@/lib/utils'
import { createInfluencerHookVideo } from '@/services/influencer.service'
import { useProjectStore, getProjectId } from '@/store/project.store'
import { commitHaptic } from '@/utils/haptics'
import {
  INFLUENCER_HOOK_VIDEO_ASPECT_RATIO,
  INFLUENCER_HOOK_VIDEO_COUNT_DEFAULT,
  INFLUENCER_HOOK_VIDEO_COUNT_MAX,
  INFLUENCER_HOOK_VIDEO_COUNT_MIN,
  INFLUENCER_HOOK_VIDEO_RESOLUTION,
  type InfluencerHookPresetId,
  type Model,
} from '@socialista/types'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
  FingerprintIcon,
  HandIcon,
  LoaderCircleIcon,
  MessageCircleIcon,
  MinusIcon,
  MousePointerClickIcon,
  PartyPopperIcon,
  PointerIcon,
  RefreshCcwIcon,
  ScanEyeIcon,
  ScanSearchIcon,
  SmileIcon,
  SparklesIcon,
  SpeechIcon,
  TimerIcon,
  UserRoundIcon,
  ZapIcon,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const FAILED_STATUSES = new Set([
  'FAILED',
  'CRASHED',
  'SYSTEM_FAILURE',
  'CANCELED',
  'CANCELLED',
  'TIMED_OUT',
  'EXPIRED',
  'INTERRUPTED',
])

const HOOK_FORMAT_ICONS: Record<InfluencerHookPresetId, LucideIcon> = {
  'shocked-reaction': ZapIcon,
  'wait-for-it': TimerIcon,
  'pov-lean': UserRoundIcon,
  'hot-take': SpeechIcon,
  'skeptical-squint': ScanEyeIcon,
  'sad-snob': MinusIcon,
  'hand-on-mouth': HandIcon,
  'finger-point': PointerIcon,
  'side-eye': EyeIcon,
  'double-take': RefreshCcwIcon,
  'eye-roll': EyeOffIcon,
  'knowing-smirk': SmileIcon,
  'whisper-tea': MessageCircleIcon,
  'stitch-glance': ScanSearchIcon,
  'look-down-up': MousePointerClickIcon,
  'eyebrow-raise': SparklesIcon,
  'cringe-wince': ScanEyeIcon,
  'plot-twist': RefreshCcwIcon,
  'soft-laugh': PartyPopperIcon,
  'knowing-nod': SpeechIcon,
  'head-shake-no': MinusIcon,
  'peek-fingers': HandIcon,
  'chefs-kiss': PartyPopperIcon,
  'come-closer': FingerprintIcon,
  'unimpressed-blink': EyeIcon,
  'slow-realize': SparklesIcon,
}

type InfluencerHookVideoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  influencerId: string
  influencerName: string
  sourceImageUrl: string
  models: Model[]
  onGenerated: () => void
}

function runErrorMessage(run: { metadata?: Record<string, unknown> } | undefined) {
  const error = run?.metadata?.error
  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'Hook video generation failed'
}

function runStatusLabel(run: { metadata?: Record<string, unknown> } | undefined) {
  const status = run?.metadata?.status
  if (typeof status === 'object' && status && 'label' in status && typeof status.label === 'string') {
    return status.label
  }
  return 'Generating hook video…'
}

function FormatCarouselNav() {
  const { canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useCarousel()

  if (!canScrollPrev && !canScrollNext) return null

  const buttonClass = cn(
    'inline-flex size-8 items-center justify-center rounded-full',
    'text-black/50 dark:text-white/50',
    'transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
    'hover:bg-black/[0.05] hover:text-foreground dark:hover:bg-white/[0.08]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
    'active:scale-[0.96] motion-reduce:active:scale-100',
    'disabled:pointer-events-none disabled:opacity-30',
  )

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" aria-label="Scroll formats left" disabled={!canScrollPrev} onClick={scrollPrev} className={buttonClass}>
        <ChevronLeftIcon className="size-3.5" strokeWidth={1.75} />
      </button>
      <button type="button" aria-label="Scroll formats right" disabled={!canScrollNext} onClick={scrollNext} className={buttonClass}>
        <ChevronRightIcon className="size-3.5" strokeWidth={1.75} />
      </button>
    </div>
  )
}

function HookFormatCarousel({
  selectedId,
  onSelect,
}: {
  selectedId?: InfluencerHookPresetId
  onSelect: (id: InfluencerHookPresetId) => void
}) {
  return (
    <Carousel
      className="w-full min-w-0"
      opts={{
        align: 'start',
        dragFree: true,
        containScroll: 'trimSnaps',
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium leading-none tracking-[-0.011em] text-black/56 dark:text-white/56">
          Formats
        </p>
        <FormatCarouselNav />
      </div>

      <div className="relative min-w-0">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-background to-transparent"
        />
        <CarouselContent className="ml-0 h-auto" role="listbox" aria-label="Hook formats">
          {INFLUENCER_HOOK_FORMATS.map((preset, index) => {
            const Icon = HOOK_FORMAT_ICONS[preset.id] ?? SparklesIcon
            const isActive = selectedId === preset.id

            return (
              <CarouselItem
                key={preset.id}
                className={cn('basis-auto self-stretch pl-0', index > 0 && 'pl-2')}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  title={preset.description}
                  onClick={() => {
                    onSelect(preset.id)
                    commitHaptic({ vibrateDuration: 8 })
                  }}
                  className={cn(
                    'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5',
                    'text-[13px] font-medium leading-none tracking-[-0.015em]',
                    'transition-[background-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                    'active:scale-[0.96] motion-reduce:active:scale-100',
                    isActive
                      ? 'bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.16),inset_0_1px_0_0_rgba(255,255,255,0.2)]'
                      : 'bg-black/[0.045] text-foreground/72 hover:bg-black/[0.08] hover:text-foreground dark:bg-white/[0.07] dark:text-white/74 dark:hover:bg-white/[0.12] dark:hover:text-white',
                  )}
                >
                  <Icon className="size-3.5 shrink-0 opacity-70" strokeWidth={1.75} aria-hidden />
                  <span className="whitespace-nowrap">{preset.label}</span>
                </button>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </div>
    </Carousel>
  )
}

export function InfluencerHookVideoDialog({
  open,
  onOpenChange,
  influencerId,
  influencerName,
  sourceImageUrl,
  models,
  onGenerated,
}: InfluencerHookVideoDialogProps) {
  const projectId = useProjectStore(s => getProjectId(s.currentProject))
  const [presetId, setPresetId] = useState<InfluencerHookPresetId | undefined>()
  const [prompt, setPrompt] = useState('')
  const [pending, setPending] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const completedRunRef = useRef<string | null>(null)

  const { run } = useGenerationRun({
    runId: runId ?? '',
    accessToken,
  })

  const runFailed = Boolean(run?.status && FAILED_STATUSES.has(run.status))
  const selectedFormat = INFLUENCER_HOOK_FORMATS.find(item => item.id === presetId)

  useEffect(() => {
    if (!runId || run?.status !== 'COMPLETED') return
    if (completedRunRef.current === runId) return
    completedRunRef.current = runId
    toast.success('Hook video ready')
    onGenerated()
    onOpenChange(false)
  }, [onGenerated, onOpenChange, run?.status, runId])

  const handlePreset = (id: InfluencerHookPresetId) => {
    const preset = INFLUENCER_HOOK_FORMATS.find(item => item.id === id)
    if (!preset) return
    setPresetId(id)
    setPrompt(preset.prompt)
  }

  const handleRetry = () => {
    setPending(false)
    setRunId(null)
    setAccessToken(null)
  }

  const handleSubmit = async (result: VideoPromptSubmitResult) => {
    setPending(true)
    const response = await createInfluencerHookVideo(influencerId, {
      sourceImageUrl,
      prompt: result.prompt,
      model: result.model,
      duration: result.duration,
      count: result.count,
      ...(presetId ? { presetId } : {}),
      ...(projectId ? { projectId } : {}),
    })

    if (!response.success || !response.data) {
      toast.error(response.message ?? 'Failed to start hook video')
      setPending(false)
      return
    }

    storeGenerationAccessToken(response.data.runId, response.data.publicAccessToken)
    setRunId(response.data.runId)
    setAccessToken(response.data.publicAccessToken)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate hook video</DialogTitle>
          <DialogDescription>
            Animate {influencerName} from this still. The reference image stays locked.
          </DialogDescription>
        </DialogHeader>

        {runId ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-muted/20 px-6 py-12 ring-1 ring-border/40">
            {runFailed ? (
              <>
                <p className="text-[15px] font-medium tracking-[-0.02em] text-destructive">
                  {runErrorMessage(run)}
                </p>
                <Button type="button" variant="outline" className="rounded-xl" onClick={handleRetry}>
                  Try again
                </Button>
              </>
            ) : (
              <>
                <LoaderCircleIcon className="size-7 animate-spin text-muted-foreground" strokeWidth={1.5} />
                <p className="text-[15px] font-medium tracking-[-0.02em]">{runStatusLabel(run)}</p>
              </>
            )}
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-3">
            <HookFormatCarousel selectedId={presetId} onSelect={handlePreset} />
            {selectedFormat ? (
              <p className="text-[12px] leading-snug text-muted-foreground">{selectedFormat.description}</p>
            ) : null}

            <VideoPromptInput
              key={`${sourceImageUrl}-${presetId ?? 'custom'}`}
              models={models}
              bindStudio={false}
              hideExtras
              embedded
              autoFocus
              pending={pending}
              initialPrompt={prompt}
              initialAttachmentUrl={sourceImageUrl}
              attachmentsLocked
              hideAspectRatio
              hideResolution
              hideAudio
              hideEnhance
              initialAspectRatio={INFLUENCER_HOOK_VIDEO_ASPECT_RATIO}
              initialResolution={INFLUENCER_HOOK_VIDEO_RESOLUTION}
              initialGenerateAudio
              maxAttachments={1}
              minAttachments={1}
              placeholder="the person from @image1 turns toward camera and reacts…"
              countOptions={{
                min: INFLUENCER_HOOK_VIDEO_COUNT_MIN,
                max: INFLUENCER_HOOK_VIDEO_COUNT_MAX,
                initial: INFLUENCER_HOOK_VIDEO_COUNT_DEFAULT,
              }}
              onSubmitOverride={result => {
                void handleSubmit(result)
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
