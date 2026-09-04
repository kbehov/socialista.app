'use client'

import { ProductPickerDialog } from '@/components/studio/static-ads/product-picker-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { dashboardSurface } from '@/components/dashboard'
import { cn } from '@/lib/utils'
import { extractProduct } from '@/services/product.service'
import { uploadToWorkspace } from '@/services/files.service'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import {
  inferUgcProductKind,
  parseUgcProductKind,
  UGC_PRODUCT_KIND_LABELS,
  UGC_PRODUCT_KINDS,
  type UgcProductKind,
} from '@socialista/types'
import { ImageIcon, LinkIcon, Loader2Icon, PackageIcon, UploadIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

export type UgcProductChange = {
  imageUrls: string[]
  productName?: string
  productId?: string | null
  productDescription?: string
  productUrl?: string | null
  productKind?: UgcProductKind | null
}

type UgcProductInputProps = {
  workspaceId: string
  imageUrls: string[]
  productName?: string
  productId?: string
  productDescription?: string
  productUrl?: string
  productKind?: UgcProductKind
  disabled?: boolean
  embedded?: boolean
  onChange: (next: UgcProductChange) => void
}

export function UgcProductInput({
  workspaceId,
  imageUrls,
  productName,
  productId,
  productDescription = '',
  productUrl,
  productKind,
  disabled,
  embedded,
  onChange,
}: UgcProductInputProps) {
  const products = useUgcProjectStore(s => s.products)
  const productsTruncated = useUgcProjectStore(s => s.productsTruncated)
  const productsLoading = useUgcProjectStore(s => s.productsLoading)
  const ensureProducts = useUgcProjectStore(s => s.ensureProducts)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [urlValue, setUrlValue] = useState(productUrl ?? '')
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, startUpload] = useTransition()
  const [extracting, startExtract] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewUrl = imageUrls[0]
  const busy = uploading || extracting || disabled
  const kind = parseUgcProductKind(productKind) ?? inferUgcProductKind({ url: urlValue, description: productDescription })

  const emit = useCallback(
    (patch: Partial<UgcProductChange> & { imageUrls?: string[] }) => {
      onChange({
        imageUrls: patch.imageUrls ?? imageUrls,
        productName: patch.productName === undefined ? productName : patch.productName,
        productId: patch.productId === undefined ? (productId ?? null) : patch.productId,
        productDescription:
          patch.productDescription === undefined ? productDescription : patch.productDescription,
        productUrl: patch.productUrl === undefined ? (urlValue.trim() || productUrl || null) : patch.productUrl,
        productKind: patch.productKind === undefined ? (productKind ?? null) : patch.productKind,
      })
    },
    [imageUrls, onChange, productDescription, productId, productKind, productName, productUrl, urlValue],
  )

  const uploadFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Use a product photo')
        return
      }
      startUpload(async () => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await uploadToWorkspace(workspaceId, formData)
        if (!response.success || !response.data?.url) {
          toast.error(response.message ?? 'Upload failed')
          return
        }
        emit({ imageUrls: [response.data.url] })
      })
    },
    [emit, workspaceId],
  )

  const handleExtract = () => {
    const url = urlValue.trim()
    if (!url) return
    startExtract(async () => {
      const response = await extractProduct(url)
      if (!response.success || !response.data) {
        emit({
          productUrl: url,
          productKind: inferUgcProductKind({ url, description: productDescription }),
        })
        toast.error(response.message ?? 'Could not read that URL — you can still describe it below')
        return
      }
      const images = (response.data.image ?? []).filter(Boolean)
      onChange({
        imageUrls: images.length > 0 ? images.slice(0, 4) : imageUrls,
        productName: response.data.name || productName,
        productId: null,
        productDescription: productDescription || response.data.description,
        productUrl: url,
        productKind: inferUgcProductKind({
          url,
          description: productDescription || response.data.description,
        }),
      })
    })
  }

  const body = (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="flex items-center gap-3">
          <div className="relative size-20 overflow-hidden rounded-2xl bg-muted ring-1 ring-border/60">
            <Image alt={productName || 'Product'} className="object-cover" fill sizes="80px" src={previewUrl} unoptimized />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium tracking-tight">{productName || 'Product photo'}</p>
            <p className="text-[11px] text-muted-foreground">
              {imageUrls.length > 1 ? `${imageUrls.length} photos` : 'Ready'}
            </p>
          </div>
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            disabled={busy}
            aria-label="Remove product photo"
            onClick={() => emit({ imageUrls: [], productId: null })}
          >
            <XIcon className="size-3.5" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={event => {
            event.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={event => {
            event.preventDefault()
            setIsDragOver(false)
            const file = event.dataTransfer.files[0]
            if (file) uploadFile(file)
          }}
          className={cn(
            dashboardSurface.insetDashed,
            'flex w-full flex-col items-center justify-center gap-2 px-4 py-10 text-center transition-colors',
            isDragOver && 'border-foreground/40 bg-muted/30',
            busy && 'opacity-60',
          )}
        >
          {uploading ? (
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          ) : (
            <UploadIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
          )}
          <span className="text-[13px] font-medium">Drop a photo</span>
          <span className="text-[11px] text-muted-foreground">or click to upload</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={event => {
          const file = event.target.files?.[0]
          if (file) uploadFile(file)
          event.target.value = ''
        }}
      />

      <Input
        value={urlValue}
        onChange={event => {
          const next = event.target.value
          setUrlValue(next)
          emit({
            productUrl: next.trim() || null,
          })
        }}
        onBlur={() => {
          const url = urlValue.trim()
          if (!url && !productUrl) return
          emit({
            productUrl: url || null,
            ...(!productKind
              ? { productKind: inferUgcProductKind({ url, description: productDescription }) }
              : {}),
          })
        }}
        placeholder="Paste your site, App Store link, or product URL"
        disabled={busy}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            event.preventDefault()
            handleExtract()
          }
        }}
      />

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" disabled={busy || !urlValue.trim()} onClick={handleExtract}>
          {extracting ? <Loader2Icon className="size-3.5 animate-spin" /> : <LinkIcon className="size-3.5" />}
          Fetch photos
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="size-3.5" />
          Upload
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => {
            setCatalogOpen(true)
            void ensureProducts(workspaceId)
          }}
        >
          <PackageIcon className="size-3.5" />
          Catalog
        </Button>
      </div>

      <Textarea
        value={productDescription}
        onChange={event => emit({ productDescription: event.target.value })}
        placeholder="Or describe what it is — a skincare serum, a habit app, a booking site…"
        className="min-h-24 text-[13px]"
        disabled={busy}
      />

      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="What you're advertising">
        {UGC_PRODUCT_KINDS.map(value => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={kind === value}
            disabled={busy}
            onClick={() => emit({ productKind: value })}
            className={cn(
              'rounded-full px-3 py-1 text-[12px] font-medium ring-1 transition',
              kind === value
                ? 'bg-foreground text-background ring-foreground'
                : 'text-muted-foreground ring-border/70 hover:text-foreground',
            )}
          >
            {UGC_PRODUCT_KIND_LABELS[value]}
          </button>
        ))}
      </div>

      <ProductPickerDialog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        products={products}
        workspaceId={workspaceId}
        productsTruncated={productsTruncated}
        loading={productsLoading}
        selected={previewUrl ? [{ url: previewUrl, productId, label: productName }] : []}
        onConfirm={images => {
          const first = images[0]
          if (!first) return
          const product = products.find(item => item._id === first.productId)
          onChange({
            imageUrls: images.map(image => image.url),
            productName: first.label || product?.name,
            productId: first.productId ?? null,
            productDescription: productDescription || product?.description,
            productUrl: product?.url ?? productUrl ?? null,
            productKind,
          })
        }}
      />
    </div>
  )

  if (embedded) return body

  return (
    <section className={dashboardSurface.section}>
      <div className={cn(dashboardSurface.sectionHeader, 'px-4 py-3')}>
        <h2 className={dashboardSurface.sectionTitle}>Product</h2>
        <p className={dashboardSurface.sectionDescription}>Paste a URL, describe it, or drop a photo.</p>
      </div>
      <div className="p-4">{body}</div>
    </section>
  )
}
