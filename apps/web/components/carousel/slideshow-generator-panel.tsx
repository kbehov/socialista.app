'use client'

import { useState, useTransition } from 'react'
import { Loader2Icon, SparklesIcon } from 'lucide-react'
import { toast } from 'sonner'
import { generateSlideshowContent } from '@/lib/ai'
import {
  ASPECT_RATIO_PRESETS,
  DEFAULT_ASPECT_RATIO_ID,
  formatAspectRatio,
  getAspectRatioPreset,
} from '@/lib/carousel/aspect-ratios'
import { useEditorStore } from '@/lib/carousel/store'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const SLIDE_COUNT_OPTIONS = [3, 4, 5, 6, 7, 8, 10] as const

export function SlideshowGeneratorPanel() {
  const setCanvas = useEditorStore(s => s.setCanvas)
  const applyGeneratedContent = useEditorStore(s => s.applyGeneratedContent)
  const canvas = useEditorStore(s => s.canvas)

  const [hook, setHook] = useState('')
  const [slideCount, setSlideCount] = useState<number>(5)
  const [aspectRatioId, setAspectRatioId] = useState(DEFAULT_ASPECT_RATIO_ID)
  const [isPending, startTransition] = useTransition()

  const activePreset = getAspectRatioPreset(aspectRatioId)

  const handleAspectRatioChange = (id: string) => {
    setAspectRatioId(id)
    const preset = getAspectRatioPreset(id)
    setCanvas(preset.dimensions)
  }

  const handleGenerate = () => {
    const trimmed = hook.trim()
    if (!trimmed) {
      toast.error('Enter a hook or topic first')
      return
    }

    startTransition(async () => {
      try {
        const texts = await generateSlideshowContent(trimmed, slideCount)
        if (texts.length === 0) {
          toast.error('No slides were generated. Try again.')
          return
        }
        applyGeneratedContent(texts)
        toast.success(`Generated ${texts.length} slides`)
      } catch {
        toast.error('Failed to generate slides. Please try again.')
      }
    })
  }

  const platforms = [...new Set(ASPECT_RATIO_PRESETS.map(p => p.platform))]

  return (
    <aside className="flex h-full flex-col rounded-xl border bg-card shadow-xs">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">AI generator</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Describe your hook — we&apos;ll draft slide copy you can style in the editor.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div className="space-y-1.5">
          <Label htmlFor="slideshow-hook" className="text-xs font-medium">
            Hook or topic
          </Label>
          <Textarea
            id="slideshow-hook"
            placeholder="e.g. 5 things i wish i knew before starting content creation"
            value={hook}
            onChange={e => setHook(e.target.value)}
            rows={4}
            className="min-h-24 resize-none text-sm"
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Slides</Label>
            <Select
              value={String(slideCount)}
              onValueChange={v => setSlideCount(Number(v))}
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SLIDE_COUNT_OPTIONS.map(n => (
                  <SelectItem key={n} value={String(n)}>
                    {n} slides
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Format</Label>
            <Select value={aspectRatioId} onValueChange={handleAspectRatioChange} disabled={isPending}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {platforms.map(platform => (
                  <SelectGroup key={platform}>
                    <SelectLabel>{platform}</SelectLabel>
                    {ASPECT_RATIO_PRESETS.filter(p => p.platform === platform).map(preset => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border border-dashed bg-muted/40 px-3 py-2.5">
          <p className="text-[11px] font-medium text-muted-foreground">Canvas size</p>
          <p className="mt-0.5 text-sm font-medium">
            {canvas.width} × {canvas.height}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              ({formatAspectRatio(canvas)})
            </span>
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {activePreset.platform} · {activePreset.label}
          </p>
        </div>

        <Button className="w-full" onClick={handleGenerate} disabled={isPending || !hook.trim()}>
          {isPending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
          {isPending ? 'Generating…' : 'Generate slides'}
        </Button>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Generated text lands on each slide as an editable layer. Add backgrounds, tweak fonts, and
          export when ready.
        </p>
      </div>
    </aside>
  )
}

export function AspectRatioBadge({ className }: { className?: string }) {
  const canvas = useEditorStore(s => s.canvas)
  return (
    <span className={cn('text-xs text-muted-foreground', className)}>
      {canvas.width}×{canvas.height}
    </span>
  )
}
