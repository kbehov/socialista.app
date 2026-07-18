'use client'

import { EmptyState } from '@/components/common/empty-state'
import { AddProductTrigger } from '@/components/products/add-product-trigger'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { uploadToWorkspace } from '@/services/files.service'
import type { Product } from '@socialista/types'
import {
  CheckIcon,
  ImageIcon,
  Loader2Icon,
  PackageIcon,
  SearchIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

export type SelectedProductImage = {
  url: string
  label?: string
  productId?: string
}

type ProductPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
  workspaceId: string
  selected: SelectedProductImage[]
  onConfirm: (images: SelectedProductImage[]) => void
  productsTruncated?: boolean
}

function formatPrice(price: number) {
  if (price <= 0) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price)
}

function ProductPickerCard({
  product,
  draft,
  onSelect,
}: {
  product: Product
  draft: SelectedProductImage | null
  onSelect: (imageUrl: string) => void
}) {
  const images = product.images ?? []
  const hasImages = images.length > 0
  const [localPreviewIndex, setLocalPreviewIndex] = useState(0)
  const draftImageIndex =
    draft?.productId === product._id && draft.url ? images.indexOf(draft.url) : -1
  const previewIndex = draftImageIndex >= 0 ? draftImageIndex : localPreviewIndex
  const previewUrl = images[previewIndex]
  const isSelected =
    Boolean(previewUrl) &&
    draft?.url === previewUrl &&
    draft?.productId === product._id
  const priceLabel = formatPrice(product.price)

  const handleSelect = () => {
    if (!previewUrl) return
    onSelect(previewUrl)
  }

  return (
    <article
      className={cn(
        'group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/55 bg-background transition-[border-color,box-shadow]',
        hasImages && 'hover:border-border hover:shadow-sm',
        isSelected && 'border-foreground/30 shadow-sm',
        !hasImages && 'opacity-60',
      )}
    >
      <button
        type="button"
        disabled={!hasImages}
        aria-label={
          hasImages
            ? `Select ${product.name}${isSelected ? ', currently selected' : ''}`
            : `${product.name} has no images`
        }
        aria-pressed={isSelected}
        onClick={handleSelect}
        className={cn(
          'relative aspect-square w-full overflow-hidden bg-muted/25 text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          !hasImages && 'cursor-not-allowed',
        )}
      >
        {previewUrl ? (
          <Image
            alt=""
            aria-hidden
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
            fill
            sizes="(max-width: 640px) 50vw, 220px"
            src={previewUrl}
            unoptimized
          />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <ImageIcon className="size-5" strokeWidth={1.5} />
            <span className="text-[11px]">No image</span>
          </span>
        )}

        {images.length > 1 ? (
          <span className="absolute top-2 left-2 rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground shadow-sm backdrop-blur-sm">
            {images.length} photos
          </span>
        ) : null}

        {isSelected ? (
          <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-foreground text-background shadow-sm">
            <CheckIcon className="size-3.5" strokeWidth={2.5} />
          </span>
        ) : null}
      </button>

      {images.length > 1 ? (
        <div
          className="flex gap-1 overflow-x-auto overscroll-x-contain border-t border-border/40 bg-muted/10 px-2 py-2 [scrollbar-width:thin]"
          role="group"
          aria-label={`${product.name} photos`}
        >
          {images.map((imageUrl, index) => {
            const isPreview = index === previewIndex
            const isImageSelected =
              draft?.url === imageUrl && draft?.productId === product._id

            return (
              <button
                key={imageUrl}
                type="button"
                aria-label={`${product.name} photo ${index + 1}`}
                aria-pressed={isImageSelected}
                onClick={() => {
                  setLocalPreviewIndex(index)
                  onSelect(imageUrl)
                }}
                className={cn(
                  'relative size-9 shrink-0 overflow-hidden rounded-md ring-offset-background transition',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isPreview && 'ring-2 ring-foreground/70',
                  isImageSelected && !isPreview && 'ring-1 ring-foreground/40',
                )}
              >
                <Image
                  alt=""
                  aria-hidden
                  className="object-cover"
                  fill
                  sizes="36px"
                  src={imageUrl}
                  unoptimized
                />
              </button>
            )
          })}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-0.5 border-t border-border/40 px-3 py-2.5">
        <h3 className="line-clamp-2 text-[13px] leading-snug font-medium tracking-[-0.01em] text-foreground">
          {product.name}
        </h3>
        {priceLabel ? (
          <p className="text-[12px] font-medium tabular-nums text-muted-foreground">{priceLabel}</p>
        ) : (
          <p className="text-[11px] text-muted-foreground/80">Catalog product</p>
        )}
      </div>
    </article>
  )
}

export function ProductPickerDialog({
  open,
  onOpenChange,
  products,
  workspaceId,
  selected,
  onConfirm,
  productsTruncated = false,
}: ProductPickerDialogProps) {
  const [draft, setDraft] = useState<SelectedProductImage | null>(selected[0] ?? null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploading, startUpload] = useTransition()
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setDraft(selected[0] ?? null)
        setSearchQuery('')
      }
      onOpenChange(next)
    },
    [onOpenChange, selected],
  )

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return products

    return products.filter(product => product.name.toLowerCase().includes(query))
  }, [products, searchQuery])

  const selectProductImage = (product: Product, imageUrl: string) => {
    setDraft({ url: imageUrl, label: product.name, productId: product._id })
  }

  const handleUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error(`“${file.name}” is not an image.`)
      return
    }

    startUpload(async () => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await uploadToWorkspace(workspaceId, formData)

      if (!response.success || !response.data?.url) {
        toast.error(response.message ?? `Failed to upload “${file.name}”`)
        return
      }

      setDraft({
        url: response.data.url,
        label: file.name,
      })
      toast.success('Image uploaded')
    })
  }

  const handleConfirm = () => {
    onConfirm(draft ? [draft] : [])
    onOpenChange(false)
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    if (!isUploading) setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    if (isUploading) return
    handleUpload(event.dataTransfer.files)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(88vh,760px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <div className="shrink-0 space-y-1 border-b border-border/60 px-6 py-5 pr-12">
          <DialogHeader className="gap-1.5 text-left">
            <DialogTitle className="text-base font-semibold tracking-tight">
              Choose product image
            </DialogTitle>
            <DialogDescription>
              Pick a catalog product or upload a photo for your ad hero.
            </DialogDescription>
          </DialogHeader>
        </div>

        {draft ? (
          <div className="shrink-0 border-b border-border/50 bg-muted/10 px-6 py-3">
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background px-3 py-2.5">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-border/60">
                <Image
                  alt={draft.label ?? 'Selected product'}
                  className="object-cover"
                  fill
                  sizes="56px"
                  src={draft.url}
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {draft.label ?? 'Selected image'}
                </p>
                <p className="text-[11px] text-muted-foreground">Selected for this ad</p>
              </div>
              <button
                type="button"
                aria-label="Remove selected image"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                onClick={() => setDraft(null)}
              >
                <XIcon className="size-4" />
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Tabs defaultValue="catalog" className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
            <div className="shrink-0 px-6 pt-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="catalog">Catalog</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="catalog"
              className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
            >
              <div className="shrink-0 space-y-2 px-6 pt-3 pb-2">
                <div className="relative">
                  <SearchIcon
                    className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    aria-label="Search products"
                    className="h-9 pl-8 text-sm"
                    onChange={event => setSearchQuery(event.target.value)}
                    placeholder="Search your catalog…"
                    value={searchQuery}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span>
                    {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
                  </span>
                  {productsTruncated ? <span>Showing first 100 — search to narrow</span> : null}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-4">
                {products.length === 0 ? (
                  <EmptyState
                    action={
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <AddProductTrigger workspaceId={workspaceId} label="Add product" />
                        <Button asChild size="sm" variant="outline">
                          <Link href={DASHBOARD_ROUTES.PRODUCTS}>View catalog</Link>
                        </Button>
                      </div>
                    }
                    description="Add products to your catalog, or upload an image in the Upload tab."
                    icon={PackageIcon}
                    minHeight="md"
                    title="No products yet"
                    variant="ghost"
                  />
                ) : filteredProducts.length === 0 ? (
                  <EmptyState
                    description="Try a different search term."
                    icon={SearchIcon}
                    minHeight="sm"
                    title="No matching products"
                    variant="ghost"
                  />
                ) : (
                  <div
                    className="grid grid-cols-2 gap-3 sm:grid-cols-3"
                    role="list"
                    aria-label="Product catalog"
                  >
                    {filteredProducts.map(product => (
                      <div key={product._id} className="min-w-0" role="listitem">
                        <ProductPickerCard
                          draft={draft}
                          product={product}
                          onSelect={imageUrl => selectProductImage(product, imageUrl)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="upload"
              className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain data-[state=inactive]:hidden"
            >
              <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={isUploading}
                  onChange={event => {
                    handleUpload(event.target.files)
                    event.target.value = ''
                  }}
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    'flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center transition',
                    isDragOver
                      ? 'border-foreground/30 bg-muted/25'
                      : 'border-border/70 bg-muted/15 hover:border-border hover:bg-muted/25',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                    isUploading && 'opacity-60',
                  )}
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                    {isUploading ? (
                      <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
                    ) : (
                      <UploadIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
                    )}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {isUploading ? 'Uploading…' : 'Upload product photo'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Drag and drop or click to browse. PNG, JPG, or WebP.
                    </p>
                  </div>
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="relative z-10 shrink-0 border-t border-border/60 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isUploading || !draft}>
            Use image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
