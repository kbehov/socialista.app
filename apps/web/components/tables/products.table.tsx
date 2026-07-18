'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { deleteProduct } from '@/services/product.service'
import { formatRelativeTime } from '@/utils/format'
import type { Product } from '@socialista/types'
import { ExternalLinkIcon, ImageIcon, MoreHorizontalIcon, Trash2Icon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type ProductsTableProps = {
  products: Product[]
  className?: string
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price)
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function getStoreLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'External store'
  }
}

function ProductThumbnail({ images, name }: { images: string[]; name: string }) {
  const thumbnail = images[0]
  const extraCount = Math.max(0, images.length - 1)

  if (!thumbnail) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted ring-1 ring-border/60">
        <ImageIcon className="size-4 text-muted-foreground" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
      <Image src={thumbnail} alt="" fill unoptimized sizes="48px" className="object-cover" />
      {extraCount > 0 && (
        <span className="absolute right-0.5 bottom-0.5 rounded bg-black/60 px-1 py-px text-[9px] font-medium text-white backdrop-blur-sm">
          +{extraCount}
        </span>
      )}
      <span className="sr-only">{name}</span>
    </div>
  )
}

export function ProductsTable({ products, className }: ProductsTableProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    const response = await deleteProduct(deleteTarget._id)
    setIsDeleting(false)

    if (!response.success) {
      toast.error(response.message ?? 'Failed to delete product')
      return
    }

    toast.success(`Removed “${deleteTarget.name}”`)
    setDeleteTarget(null)
    router.refresh()
  }

  return (
  <>
    <div className={cn('overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs', className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 bg-muted/30 hover:bg-muted/30">
            <TableHead className="h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Product
            </TableHead>
            <TableHead className="h-11 px-4 text-right text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Price
            </TableHead>
            <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase md:table-cell">
              Store
            </TableHead>
            <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell">
              Added
            </TableHead>
            <TableHead className="h-11 w-[52px] px-2" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map(product => {
            const storeLabel = getStoreLabel(product.url)

            return (
              <TableRow key={product._id} className="group border-border/50 hover:bg-muted/25">
                <TableCell className="px-4 py-3.5 whitespace-normal">
                  <div className="flex min-w-0 items-center gap-3">
                    <ProductThumbnail images={product.images} name={product.name} />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium tracking-tight text-foreground">{product.name}</p>
                      {product.description ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{product.description}</p>
                      ) : (
                        <p className="mt-0.5 text-xs text-muted-foreground md:hidden">{storeLabel}</p>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3.5 text-right">
                  <span className="text-sm font-semibold tabular-nums tracking-tight text-foreground">
                    {formatPrice(product.price)}
                  </span>
                </TableCell>

                <TableCell className="hidden px-4 py-3.5 md:table-cell">
                  <Badge variant="outline" className="max-w-[180px] truncate font-normal">
                    {storeLabel}
                  </Badge>
                </TableCell>

                <TableCell className="hidden px-4 py-3.5 lg:table-cell">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-default text-xs text-muted-foreground">
                        {formatRelativeTime(product.createdAt)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">{formatDate(product.createdAt)}</TooltipContent>
                  </Tooltip>
                </TableCell>

                <TableCell className="px-2 py-3.5">
                  <div className="flex justify-end opacity-70 transition-opacity group-hover:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="size-8 rounded-lg"
                          aria-label={`Actions for ${product.name}`}
                        >
                          <MoreHorizontalIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link href={product.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLinkIcon />
                            View source
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2Icon />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>

    <DeleteConfirmDialog
      open={deleteTarget !== null}
      onOpenChange={open => {
        if (!open) setDeleteTarget(null)
      }}
      title="Delete product"
      description={
        deleteTarget
          ? `“${deleteTarget.name}” will be removed from your catalog. This cannot be undone.`
          : ''
      }
      confirmLabel="Delete product"
      isDeleting={isDeleting}
      onConfirm={() => void handleDelete()}
    />
  </>
  )
}
