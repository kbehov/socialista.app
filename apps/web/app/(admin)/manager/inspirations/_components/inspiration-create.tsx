'use client'

import { FieldError, FieldLabel } from '@/components/forms/auth-form-shared'
import { TikTokPostCard } from '@/components/tiktok/tiktok-post-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generateSlideshowPrompt } from '@/lib/ai'
import { downloadTikTokVideo } from '@/lib/tiktok/download-video'
import type { TikTokExtractResult } from '@/lib/tiktok/extract'
import { cn } from '@/lib/utils'
import { createInspiration } from '@/services/inspiration.service'
import { zodResolver } from '@hookform/resolvers/zod'
import type { InspirationCategoryResponse, InspirationNicheResponse } from '@socialista/types'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
const extractFormSchema = z.object({
  url: z.string().trim().min(1, 'URL is required').url('Enter a valid URL'),
})

type ExtractFormValues = z.infer<typeof extractFormSchema>

function toggleItem<T extends { _id: string }>(item: T, selected: T[], onChange: (next: T[]) => void) {
  onChange(
    selected.some(entry => entry._id === item._id)
      ? selected.filter(entry => entry._id !== item._id)
      : [...selected, item],
  )
}

function SelectionGroup<T extends { _id: string; name: string; icon?: string }>({
  label,
  description,
  items,
  selected,
  onChange,
}: {
  label: string
  description: string
  items: T[]
  selected: T[]
  onChange: (next: T[]) => void
}) {
  if (items.length === 0) {
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          No {label.toLowerCase()} yet. Create one from the inspirations page.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map(item => {
          const isSelected = selected.some(entry => entry._id === item._id)
          return (
            <Button
              key={item._id}
              type="button"
              size="sm"
              variant={isSelected ? 'default' : 'outline'}
              className={cn('h-8 rounded-full px-3', isSelected && 'shadow-none')}
              onClick={() => toggleItem(item, selected, onChange)}
            >
              {item.icon ? <span className="mr-1">{item.icon}</span> : null}
              {item.name}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export function InspirationCreateWrapper({
  categories,
  niches,
}: {
  categories: InspirationCategoryResponse[]
  niches: InspirationNicheResponse[]
}) {
  const router = useRouter()
  const [preview, setPreview] = useState<TikTokExtractResult | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<InspirationCategoryResponse[]>([])
  const [selectedNiches, setSelectedNiches] = useState<InspirationNicheResponse[]>([])
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hookText, setHookText] = useState<string | null>(null)
  const [isExtractingOcr, setIsExtractingOcr] = useState(false)
  const [prompt, setPrompt] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ExtractFormValues>({
    resolver: zodResolver(extractFormSchema),
    defaultValues: { url: '' },
    mode: 'onTouched',
  })

  const onSubmit = handleSubmit(async ({ url }) => {
    setPreview(null)
    setHookText(null)
    setSaveError(null)
    setSelectedCategories([])
    setSelectedNiches([])

    try {
      const response = await fetch('/api/extract/tiktok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = (await response.json()) as TikTokExtractResult & { error?: string }

      if (!response.ok) {
        setError('root', { message: data.error ?? 'Failed to extract post' })
        return
      }

      setPreview(data)

      if (data.type === 'slideshow' && data.imageUrls[0]) {
        setIsExtractingOcr(true)
        try {
          const ocrResponse = await fetch('/api/ocr/slides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrls: [data.imageUrls[0]] }),
          })
          const ocrData = (await ocrResponse.json()) as {
            hook?: { text: string }
            error?: string
          }

          if (!ocrResponse.ok) {
            toast.error(ocrData.error ?? 'Failed to extract hook slide text')
          } else {
            setHookText(ocrData.hook?.text ?? '')
          }
          const aiprompt = await generateSlideshowPrompt(ocrData.hook?.text ?? '', data?.imageUrls.length ?? 3)
          console.log(prompt)
          setPrompt(aiprompt)
        } catch {
          toast.error('Failed to extract hook slide text')
        } finally {
          setIsExtractingOcr(false)
        }
      }
    } catch {
      setError('root', { message: 'Something went wrong. Please try again.' })
    }
  })

  const handleSave = async () => {
    if (!preview) return

    if (selectedCategories.length === 0) {
      setSaveError('Select at least one category')
      return
    }

    if (selectedNiches.length === 0) {
      setSaveError('Select at least one niche')
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      let videoUrl: string | undefined

      if (preview.type === 'video' && preview.videoUrls.length > 0) {
        const blob = await downloadTikTokVideo(preview.videoUrls)
        const formData = new FormData()
        formData.append('video', blob, 'video.mp4')

        const uploadResponse = await fetch('/api/inspirations/upload-video', {
          method: 'POST',
          body: formData,
        })
        const uploadData = (await uploadResponse.json()) as { url?: string; error?: string }

        if (!uploadResponse.ok || !uploadData.url) {
          setSaveError(uploadData.error ?? 'Failed to upload video')
          return
        }

        videoUrl = uploadData.url
      }

      const result = await createInspiration({
        contentType: preview.type,
        images: preview.imageUrls,
        videoUrl,
        author: {
          username: preview.author.username,
          nickName: preview.author.nickname,
          avatarUrl: preview.author.avatarUrl,
        },
        stats: {
          likes: preview.stats.likes,
          comments: preview.stats.comments,
          shares: preview.stats.shares,
          plays: preview.stats.views,
        },
        categories: selectedCategories.map(category => category._id),
        niches: selectedNiches.map(niche => niche._id),
      })

      if (!result.success) {
        setSaveError(result.message ?? 'Failed to create inspiration')
        return
      }

      toast.success('Inspiration created')
      router.push('/manager/inspirations')
    } catch {
      setSaveError('Something went wrong. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
      <section className="space-y-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-sm font-medium">URL</h2>
          <p className="text-xs text-muted-foreground">Paste a TikTok video or slideshow link.</p>

          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <FieldLabel htmlFor="url">TikTok url</FieldLabel>
              <Input
                id="url"
                type="url"
                placeholder="https://www.tiktok.com/@user/video/..."
                className="h-9 rounded-lg bg-background"
                aria-invalid={Boolean(errors.url)}
                {...register('url')}
              />
              <FieldError message={errors.url?.message} />
            </div>

            {errors.root?.message && (
              <p className="text-xs text-destructive" role="alert">
                {errors.root.message}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Extracting
                </>
              ) : (
                'Extract'
              )}
            </Button>
          </form>
        </div>

        {preview && (
          <div className="space-y-6 rounded-lg border p-6">
            <div>
              <h2 className="text-sm font-medium">Organize</h2>
              <p className="text-xs text-muted-foreground">Tag this inspiration before saving.</p>
            </div>

            <SelectionGroup
              label="Categories"
              description="Pick one or more broad themes."
              items={categories}
              selected={selectedCategories}
              onChange={setSelectedCategories}
            />

            <SelectionGroup
              label="Niches"
              description="Pick one or more specific niches."
              items={niches}
              selected={selectedNiches}
              onChange={setSelectedNiches}
            />

            {saveError && (
              <p className="text-xs text-destructive" role="alert">
                {saveError}
              </p>
            )}

            <Button type="button" size="lg" className="w-full" disabled={isSaving} onClick={handleSave}>
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" />
                  Saving
                </>
              ) : (
                'Save inspiration'
              )}
            </Button>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex min-h-[480px] items-center justify-center rounded-lg border border-border p-4">
          {preview ? <TikTokPostCard post={preview} /> : <p className="text-xs text-muted-foreground">No preview</p>}
        </div>

        {preview?.type === 'slideshow' && (
          <div className="rounded-lg border p-6">
            <div>
              <h2 className="text-sm font-medium">Hook text</h2>
              <p className="text-xs text-muted-foreground">OCR text extracted from the first slideshow image.</p>
            </div>

            {isExtractingOcr ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Extracting hook text…
              </div>
            ) : hookText !== null ? (
              <p className="mt-4 rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                {hookText || <span className="text-muted-foreground italic">No text detected</span>}
              </p>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">No hook text extracted yet.</p>
            )}

            {prompt && <div className="mt-4 rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">{prompt}</div>}
          </div>
        )}
      </section>
    </div>
  )
}
