'use client'

import {
  PromptInputButton,
  PromptInputProvider,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import type { AttachedMedia } from '@/components/files/attach-images-dialog'
import { STUDIO_COMPOSER_SURFACE_CLASS } from '@/components/studio/prompt/studio-composer-surface'
import { StudioPromptComposer } from '@/components/studio/prompt/studio-prompt-composer'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type { UgcClip, UgcProject } from '@socialista/types'
import { VIDEO_DURATIONS, ugcResolvedClipModels } from '@socialista/types'
import {
  ChevronDownIcon,
  DownloadIcon,
  Loader2Icon,
  PencilIcon,
  SendIcon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

const TOOL_BUTTON_CLASS = cn(
  'h-7 gap-1.5 rounded-xl border px-1.5 pr-2',
  'border-border/40 bg-background/90 hover:border-border/65',
  'active:scale-[0.97]',
)

type UgcVideoComposerProps = {
  workspaceId: string
  project: UgcProject
  clip: UgcClip
  generating?: boolean
  openingEditor?: boolean
  progress?: number
  progressLabel?: string
  onGenerate: (input: {
    prompt: string
    durationSec: number
    modelValue: string
    skipPlanner: boolean
  }) => void
  onOpenEditor: () => void
}

export function UgcVideoComposer({
  workspaceId,
  project,
  clip,
  generating,
  openingEditor,
  progress,
  progressLabel,
  onGenerate,
  onOpenEditor,
}: UgcVideoComposerProps) {
  const videoModels = useUgcProjectStore(s => s.videoModels)
  const resolved = ugcResolvedClipModels(project, clip)
  const [duration, setDuration] = useState(clip.durationSec)
  const [generateAudio, setGenerateAudio] = useState(true)
  const [selectedModelId, setSelectedModelId] = useState(
    () => videoModels.find(model => model.value === resolved.video)?._id ?? videoModels[0]?._id ?? '',
  )
  const startFrame = clip.stills.find(still => still.imageUrl)?.imageUrl
  const selectedModel = videoModels.find(model => model._id === selectedModelId) ?? videoModels[0]

  const attachments = useMemo<AttachedMedia[]>(() => {
    if (!startFrame) return []
    return [
      {
        id: `start-${clip.id}`,
        url: startFrame,
        kind: 'image',
        source: 'upload',
        label: 'Start frame',
      },
    ]
  }, [clip.id, startFrame])
  const [extraAttachments, setExtraAttachments] = useState<AttachedMedia[]>([])
  const allAttachments = [...attachments, ...extraAttachments].slice(0, 4)

  const handleSubmit = (message: PromptInputMessage) => {
    if (!selectedModel) return
    const prompt = message.text.trim()
    onGenerate({
      prompt,
      durationSec: duration,
      modelValue: selectedModel.value,
      skipPlanner: Boolean(prompt),
    })
  }

  return (
    <div className="space-y-3">
      {clip.videoUrl ? (
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[240px] overflow-hidden rounded-2xl bg-black ring-1 ring-border/50">
          <video
            className="size-full object-cover"
            controls
            playsInline
            src={clip.videoUrl}
            poster={clip.thumbnailUrl}
          />
        </div>
      ) : generating ? (
        <div className="relative mx-auto flex aspect-[9/16] w-full max-w-[240px] items-center justify-center overflow-hidden rounded-2xl bg-black/80 text-white/80">
          <div className="space-y-2 text-center">
            <Loader2Icon className="mx-auto size-6 animate-spin" />
            <p className="text-[11px]" aria-live="polite">
              {progressLabel ?? 'Generating video…'}
              {progress ? ` · ${Math.round(progress)}%` : ''}
            </p>
          </div>
        </div>
      ) : null}

      <PromptInputProvider key={`${clip.id}-video`} initialInput={clip.plannedPrompt ?? ''}>
        <StudioPromptComposer
          models={videoModels}
          selectedModelId={selectedModel?._id ?? ''}
          onSelectedModelChange={setSelectedModelId}
          attachments={allAttachments}
          onAttachmentsChange={files => {
            setExtraAttachments(files.filter(file => file.id !== `start-${clip.id}`))
          }}
          attachSources={['upload', 'library', 'influencer', 'product']}
          maxAttachments={4}
          workspaceId={workspaceId}
          placeholder="How the photo should move. Leave blank and we’ll plan it."
          pending={generating}
          disabled={generating}
          requirePrompt={false}
          onSubmit={handleSubmit}
          submitLabel="Generate video"
          surfaceClassName={STUDIO_COMPOSER_SURFACE_CLASS}
          tools={
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <PromptInputButton className={TOOL_BUTTON_CLASS} disabled={generating} type="button">
                    {duration}s
                    <ChevronDownIcon className="size-3 text-muted-foreground/60" />
                  </PromptInputButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuRadioGroup
                    value={String(duration)}
                    onValueChange={next => setDuration(Number(next))}
                  >
                    {VIDEO_DURATIONS.filter(value => value === 5 || value === 8 || value === 10 || value === 15).map(
                      value => (
                        <DropdownMenuRadioItem key={value} value={String(value)}>
                          {value}s
                        </DropdownMenuRadioItem>
                      ),
                    )}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <PromptInputButton
                type="button"
                className={TOOL_BUTTON_CLASS}
                disabled={generating}
                onClick={() => setGenerateAudio(value => !value)}
                aria-label={generateAudio ? 'Audio on' : 'Muted'}
              >
                {generateAudio ? <Volume2Icon className="size-3.5" /> : <VolumeXIcon className="size-3.5" />}
                <span className="text-xs">{generateAudio ? 'Audio' : 'Muted'}</span>
              </PromptInputButton>
            </>
          }
        />
      </PromptInputProvider>

      {clip.voice?.enabled ? (
        <p className="text-[11px] text-muted-foreground">
          Voiceover coming soon — {clip.voice.voiceName ?? 'selected voice'} is saved on this clip.
        </p>
      ) : null}

      {clip.videoUrl ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" asChild>
            <a href={clip.videoUrl} download>
              <DownloadIcon className="size-3.5" />
              Download
            </a>
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={openingEditor} onClick={onOpenEditor}>
            {openingEditor ? <Loader2Icon className="size-3.5 animate-spin" /> : <PencilIcon className="size-3.5" />}
            Open in editor
          </Button>
          {clip.generationId ? (
            <Button type="button" size="sm" variant="outline" asChild>
              <Link href={DASHBOARD_ROUTES.createPost({ generationId: clip.generationId })}>
                <SendIcon className="size-3.5" />
                Post
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
