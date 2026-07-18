'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { createProduct, extractProduct } from '@/services/product.service'
import type { ExtractProductResponse } from '@socialista/types'
import {
  AlertCircleIcon,
  ArrowRightIcon,
  ImageIcon,
  Link2Icon,
  Loader2Icon,
  SparklesIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

type AddProductDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  onCreated?: () => void
}

type ExtractState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ExtractProductResponse }
  | { status: 'error'; message: string }

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function parseExtractedPrice(price?: string | number) {
  if (price === undefined || price === null) return 0
  if (typeof price === 'number' && Number.isFinite(price)) return price
  if (typeof price === 'string') {
    const parsed = Number.parseFloat(price.replace(/[^0-9.-]/g, ''))
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function formatExtractedPrice(price?: string | number, currency?: string) {
  const amount = parseExtractedPrice(price)
  const code = currency && currency.length === 3 ? currency.toUpperCase() : 'USD'

  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(amount)
  } catch {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function AddProductDialog({ open, onOpenChange, workspaceId, onCreated }: AddProductDialogProps) {
  const [url, setUrl] = useState('')
  const [extractState, setExtractState] = useState<ExtractState>({ status: 'idle' })
  const [isExtracting, startExtract] = useTransition()
  const [isCreating, startCreate] = useTransition()

  const reset = useCallback(() => {
    setUrl('')
    setExtractState({ status: 'idle' })
  }, [])

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const handleExtract = () => {
    const trimmed = url.trim()
    if (!trimmed) {
      setExtractState({ status: 'error', message: 'Paste a product URL to continue.' })
      return
    }
    if (!isValidUrl(trimmed)) {
      setExtractState({ status: 'error', message: 'Enter a valid http or https URL.' })
      return
    }

    startExtract(async () => {
      setExtractState({ status: 'loading' })
      const response = await extractProduct(trimmed)

      if (!response.success || !response.data) {
        setExtractState({
          status: 'error',
          message: response.message ?? 'Could not extract product data from this URL.',
        })
        return
      }

      if (!response.data.name?.trim()) {
        setExtractState({
          status: 'error',
          message: 'No product name was found. Try a direct product page URL.',
        })
        return
      }

      setExtractState({ status: 'success', data: response.data })
    })
  }

  const handleCreate = () => {
    if (extractState.status !== 'success') return

    const { data } = extractState
    const name = data.name?.trim()
    if (!name) return

    startCreate(async () => {
      const response = await createProduct({
        workspaceId,
        name,
        description: data.description?.trim() ?? '',
        url: data.url,
        price: parseExtractedPrice(data.price),
        images: data.image ?? [],
      })

      if (!response.success) {
        toast.error(response.message ?? 'Failed to add product')
        return
      }

      toast.success(`Added “${name}” to your catalog`)
      onOpenChange(false)
      onCreated?.()
    })
  }

  const isBusy = isExtracting || isCreating || extractState.status === 'loading'
  const canCreate = extractState.status === 'success' && !isBusy

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(720px,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={!isBusy}
      >
        <div className="shrink-0 space-y-1 border-b border-border/60 px-6 py-5 pr-12">
          <DialogHeader className="gap-1.5 text-left">
            <DialogTitle className="text-base font-semibold tracking-tight">Add product</DialogTitle>
            <DialogDescription>
              Paste a product page URL and we&apos;ll pull the name, images, and price automatically.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="product-url" className="text-xs font-medium text-muted-foreground">
              Product URL
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Link2Icon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="product-url"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  placeholder="https://store.example.com/products/..."
                  value={url}
                  disabled={isBusy}
                  className="h-10 rounded-lg pl-8 text-sm"
                  onChange={event => {
                    setUrl(event.target.value)
                    if (extractState.status === 'error') {
                      setExtractState({ status: 'idle' })
                    }
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleExtract()
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                className="h-10 shrink-0 rounded-lg px-3.5 sm:w-auto"
                disabled={isBusy || !url.trim()}
                onClick={handleExtract}
              >
                {isExtracting || extractState.status === 'loading' ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <>
                    Extract
                    <ArrowRightIcon className="size-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>

          <div
            className={cn(
              'overflow-hidden rounded-xl border transition-colors',
              extractState.status === 'error'
                ? 'border-destructive/30 bg-destructive/5'
                : extractState.status === 'success'
                  ? 'border-border/80 bg-muted/20'
                  : 'border-dashed border-border/70 bg-muted/10',
            )}
          >
            {extractState.status === 'idle' && (
              <div className="flex min-h-[140px] flex-col items-center justify-center px-6 py-8 text-center">
                <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                  <SparklesIcon className="size-4 text-muted-foreground" strokeWidth={1.5} />
                </span>
                <p className="text-sm font-medium text-foreground">Preview will appear here</p>
                <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-muted-foreground">
                  Works with most Shopify, WooCommerce, and standard product pages.
                </p>
              </div>
            )}

            {(isExtracting || extractState.status === 'loading') && (
              <div className="flex min-h-[140px] flex-col items-center justify-center gap-3 px-6 py-8">
                <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Reading product details…</p>
              </div>
            )}

            {extractState.status === 'error' && (
              <div className="flex items-start gap-3 px-4 py-4">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircleIcon className="size-4 text-destructive" />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-medium text-destructive">Couldn&apos;t extract product</p>
                  <p className="mt-1 text-xs leading-relaxed text-destructive/80">{extractState.message}</p>
                </div>
              </div>
            )}

            {extractState.status === 'success' && (
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                <div className="relative mx-auto shrink-0 sm:mx-0">
                  {extractState.data.image?.[0] ? (
                    <div className="relative size-24 overflow-hidden rounded-lg bg-background ring-1 ring-border/60">
                      <Image
                        src={extractState.data.image[0]}
                        alt=""
                        fill
                        unoptimized
                        sizes="96px"
                        className="object-cover"
                      />
                      {(extractState.data.image.length ?? 0) > 1 && (
                        <span className="absolute right-1 bottom-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                          +{extractState.data.image.length - 1}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex size-24 items-center justify-center rounded-lg bg-muted ring-1 ring-border/60">
                      <ImageIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2.5">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold leading-snug tracking-tight text-foreground">
                      {extractState.data.name}
                    </p>
                    {extractState.data.description && (
                      <p className="max-h-24 overflow-y-auto text-xs leading-relaxed text-muted-foreground">
                        {extractState.data.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold tabular-nums tracking-tight text-foreground">
                      {formatExtractedPrice(extractState.data.price, extractState.data.currency)}
                    </span>
                    <span className="max-w-full truncate rounded-full bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border/60">
                      {getHostname(extractState.data.url)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border/60 bg-muted/15 px-6 py-4">
          <Button type="button" variant="outline" disabled={isBusy} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!canCreate} onClick={handleCreate}>
            {isCreating ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Adding…
              </>
            ) : (
              'Add to catalog'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
