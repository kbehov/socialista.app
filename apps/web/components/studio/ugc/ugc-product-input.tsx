'use client'

import { ProductPickerDialog } from '@/components/studio/static-ads/product-picker-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { dashboardSurface } from '@/components/dashboard'
import { cn } from '@/lib/utils'
import { extractProduct } from '@/services/product.service'
import { uploadToWorkspace } from '@/services/files.service'
import type { Product } from '@socialista/types'
import { ImageIcon, LinkIcon, Loader2Icon, PackageIcon, UploadIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

type UgcProductInputProps = {
  workspaceId: string
  products: Product[]
  productsTruncated?: boolean
  imageUrls: string[]
  productName?: string
  productId?: string
  disabled?: boolean
  onChange: (next: { imageUrls: string[]; productName?: string; productId?: string | null }) => void
}

export function UgcProductInput({
  workspaceId,
  products,
  productsTruncated,
  imageUrls,
  productName,
  productId,
  disabled,
  onChange,
}: UgcProductInputProps) {
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, startUpload] = useTransition()
  const [extracting, startExtract] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewUrl = imageUrls[0]
  const busy = uploading || extracting || disabled

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
        onChange({
          imageUrls: [response.data.url],
          productName,
          productId: productId ?? null,
        })
      })
    },
    [onChange, productId, productName, workspaceId],
  )

  const handleExtract = () => {
    const url = urlValue.trim()
    if (!url) return
    startExtract(async () => {
      const response = await extractProduct(url)
      if (!response.success || !response.data) {
        toast.error(response.message ?? 'Could not read that URL')
        return
      }
      const images = (response.data.image ?? []).filter(Boolean)
      if (images.length === 0) {
        toast.error('No photos found at that URL')
        return
      }
      onChange({
        imageUrls: images.slice(0, 4),
        productName: response.data.name || productName,
        productId: null,
      })
      setUrlValue('')
    })
  }

  return (
    <section className={dashboardSurface.section}>
      <div className={cn(dashboardSurface.sectionHeader, 'px-4 py-3')}>
        <h2 className={dashboardSurface.sectionTitle}>Product</h2>
        <p className={dashboardSurface.sectionDescription}>Upload a photo, pick from catalog, or paste a URL.</p>
      </div>

      <div className="space-y-3 p-4">
        {previewUrl ? (
          <div className="flex items-center gap-3">
            <div className="relative size-20 overflow-hidden rounded-xl bg-muted ring-1 ring-border/60">
              <Image alt={productName || 'Product'} className="object-cover" fill sizes="80px" src={previewUrl} unoptimized />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium tracking-tight">{productName || 'Product photo'}</p>
              <p className="text-[11px] text-muted-foreground">
                {imageUrls.length > 1 ? `${imageUrls.length} photos` : 'Ready to generate'}
              </p>
            </div>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              disabled={busy}
              aria-label="Remove product photo"
              onClick={() => onChange({ imageUrls: [], productName, productId: null })}
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
              'flex w-full flex-col items-center justify-center gap-2 px-4 py-8 text-center transition-colors',
              isDragOver && 'border-foreground/40 bg-muted/30',
              busy && 'opacity-60',
            )}
          >
            {uploading ? (
              <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <UploadIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
            )}
            <span className="text-[13px] font-medium">Drop a product photo</span>
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

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => fileInputRef.current?.click()}>
            <ImageIcon className="size-3.5" />
            Upload
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => setCatalogOpen(true)}>
            <PackageIcon className="size-3.5" />
            Catalog
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            value={urlValue}
            onChange={event => setUrlValue(event.target.value)}
            placeholder="Paste a product URL"
            disabled={busy}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleExtract()
              }
            }}
          />
          <Button type="button" size="sm" variant="secondary" disabled={busy || !urlValue.trim()} onClick={handleExtract}>
            {extracting ? <Loader2Icon className="size-3.5 animate-spin" /> : <LinkIcon className="size-3.5" />}
            Fetch
          </Button>
        </div>
      </div>

      <ProductPickerDialog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        products={products}
        workspaceId={workspaceId}
        productsTruncated={productsTruncated}
        selected={previewUrl ? [{ url: previewUrl, productId, label: productName }] : []}
        onConfirm={images => {
          const first = images[0]
          if (!first) return
          const product = products.find(item => item._id === first.productId)
          onChange({
            imageUrls: images.map(image => image.url),
            productName: first.label || product?.name,
            productId: first.productId ?? null,
          })
        }}
      />
    </section>
  )
}
