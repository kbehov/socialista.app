'use client'

import { FieldError, FieldLabel } from '@/components/forms/auth-form-shared'
import { TikTokPostCard } from '@/components/tiktok/tiktok-post-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { TikTokExtractResult } from '@/lib/tiktok/extract'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const extractFormSchema = z.object({
  url: z.string().trim().min(1, 'URL is required').url('Enter a valid URL'),
})

type ExtractFormValues = z.infer<typeof extractFormSchema>

export function InspirationCreateWrapper() {
  const [preview, setPreview] = useState<TikTokExtractResult | null>(null)

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
    } catch {
      setError('root', { message: 'Something went wrong. Please try again.' })
    }
  })

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
      <section className="border p-6 rounded-lg">
        <h2 className="text-sm font-medium">URL</h2>
        <p className="text-xs text-muted-foreground">Paste a TikTok video or slideshow link.</p>

        <form onSubmit={onSubmit} className="space-y-4 mt-4">
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
      </section>

      <section>
        <div className="flex min-h-[480px] items-center justify-center rounded-lg border border-border p-4">
          {preview ? <TikTokPostCard post={preview} /> : <p className="text-xs text-muted-foreground">No preview</p>}
        </div>
      </section>
    </div>
  )
}
