'use client'

import { useState, useTransition } from 'react'
import { Loader2Icon, SparklesIcon } from 'lucide-react'
import { toast } from 'sonner'
import { generateSlideshowContent } from '@/lib/ai'
import { useEditorStore } from '@/lib/carousel/store'
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

export function SlideshowGeneratorPanel() {
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

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
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

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
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
            className="min-h-24 resize-none text-sm"
            disabled={isPending}
          />
          <p className="text-[11px] text-muted-foreground">
            One sentence is enough — AI writes slide-by-slide copy you can edit on the canvas.
          </p>
        </div>

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

        <Button className="w-full" onClick={handleGenerate} disabled={isPending || !hook.trim()}>
          {isPending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
          {isPending ? 'Generating…' : 'Generate slides'}
        </Button>

        <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-2.5">
          <p className="text-[11px] font-medium">After generating</p>
          <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
            <li>· Pick a slide in the filmstrip below</li>
            <li>· Upload a background in the Slide tab</li>
            <li>· Style text in the Text tab, then Export ZIP</li>
          </ul>
        </div>
      </div>
    </aside>
  )
}
