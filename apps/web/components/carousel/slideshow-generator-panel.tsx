'use client'

import { useState, useTransition } from 'react'
import { Loader2Icon, SparklesIcon } from 'lucide-react'
import { toast } from 'sonner'
import { generateSlideshowSlides } from '@/actions/slideshow.actions'
import { isBlankSlide } from '@/lib/carousel/defaults'
import { useEditorStore } from '@/lib/carousel/store'
import { StudioPanelScrollArea } from '@/components/carousel/studio-segmented-tabs'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SLIDE_COUNT_OPTIONS = [3, 4, 5, 6, 7, 8, 10] as const

export function SlideshowGeneratorPanel({ embedded = false }: { embedded?: boolean }) {
  const applyGeneratedContent = useEditorStore(s => s.applyGeneratedContent)

  const [hook, setHook] = useState('')
  const [slideCount, setSlideCount] = useState<number>(5)
  const [isPending, startTransition] = useTransition()

  const handleGenerate = () => {
    const trimmed = hook.trim()
    if (!trimmed) {
      toast.error('Enter a hook or topic first')
      return
    }

    startTransition(async () => {
      const result = await generateSlideshowSlides(trimmed, slideCount)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      const slidesBefore = useEditorStore.getState().slides
      const existingCount =
        slidesBefore.length === 1 && slidesBefore[0] && isBlankSlide(slidesBefore[0])
          ? 0
          : slidesBefore.length

      applyGeneratedContent(result.texts)

      const updated = Math.min(existingCount, result.texts.length)
      const created = Math.max(0, result.texts.length - existingCount)
      const detail =
        created > 0 && updated > 0
          ? `Updated ${updated} slide${updated === 1 ? '' : 's'}, added ${created} new`
          : created > 0
            ? `Added ${created} slide${created === 1 ? '' : 's'}`
            : `Updated ${updated} slide${updated === 1 ? '' : 's'}`
      toast.success(`${detail} · ${result.contentType}`)
    })
  }

  return (
    <aside
      className={
        embedded
          ? 'flex h-full min-h-0 flex-col overflow-hidden'
          : 'flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm'
      }
    >
      {!embedded ? (
        <div className="border-b bg-muted/20 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
              1
            </span>
            <div>
              <h2 className="text-sm font-semibold leading-none">AI generator</h2>
              <p className="mt-1 text-[11px] text-muted-foreground">Optional — skip to design manually</p>
            </div>
          </div>
        </div>
      ) : null}

      <StudioPanelScrollArea>
        <div className="space-y-1.5">
          <Label htmlFor="slideshow-hook" className="text-xs font-medium">
            Hook or topic
          </Label>
          <Textarea
            id="slideshow-hook"
            placeholder="e.g. 5 things I wish I knew before starting content creation"
            value={hook}
            onChange={e => setHook(e.target.value)}
            rows={4}
            className="min-h-[5.5rem] resize-none text-sm"
            disabled={isPending}
          />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            One sentence is enough — AI adds copy without replacing your images.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Slide count</Label>
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

        <Button className="w-full" size="default" onClick={handleGenerate} disabled={isPending || !hook.trim()}>
          {isPending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
          {isPending ? 'Generating…' : 'Generate slides'}
        </Button>

        <div className="rounded-lg border border-dashed border-border/50 bg-muted/10 px-3 py-2.5">
          <p className="text-[11px] font-medium text-foreground/80">Next steps</p>
          <ol className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
            <li>1. Pick a slide in the filmstrip</li>
            <li>2. Style text in the Text tab</li>
            <li>3. Add a background in the Slide tab</li>
          </ol>
        </div>
      </StudioPanelScrollArea>
    </aside>
  )
}
