'use client'

import { BrandDialog } from '@/components/brands/brand-dialog'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { deleteBrand } from '@/services/brand.service'
import { formatRelativeTime } from '@/utils/format'
import { getInitials } from '@/utils/user'
import type { Brand } from '@socialista/types'
import { ExternalLinkIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type BrandsListProps = {
  brands: Brand[]
  workspaceId: string
  className?: string
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function getWebsiteLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function BrandLogo({ logo, name }: { logo?: string; name: string }) {
  if (!logo) {
    return (
      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.04] text-sm font-medium tracking-[-0.01em] text-foreground/56 sm:size-16">
        {getInitials(name)}
      </div>
    )
  }

  return (
    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-foreground/[0.04] sm:size-16">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt="" className="size-full object-cover" />
      <span className="sr-only">{name}</span>
    </div>
  )
}

function ColorSwatches({ colors }: { colors: string[] }) {
  if (colors.length === 0) {
    return <span className="text-sm text-foreground/44">—</span>
  }

  const visible = colors.slice(0, 5)
  const extra = colors.length - visible.length

  return (
    <div className="flex items-center gap-1.5">
      {visible.map(color => (
        <span
          key={color}
          className="size-4 rounded-full ring-1 ring-foreground/10"
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
      {extra > 0 ? <span className="text-xs text-foreground/44">+{extra}</span> : null}
    </div>
  )
}

export function BrandsList({ brands, workspaceId, className }: BrandsListProps) {
  const router = useRouter()
  const [editTarget, setEditTarget] = useState<Brand | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    const response = await deleteBrand(deleteTarget._id)
    setIsDeleting(false)

    if (!response.success) {
      toast.error(response.message ?? 'Failed to delete brand')
      return
    }

    toast.success(`Removed “${deleteTarget.name}”`)
    setDeleteTarget(null)
    router.refresh()
  }

  return (
    <>
      <div className={cn('min-w-0', className)}>
        <div
          className="hidden border-b border-foreground/10 pb-3 sm:grid sm:grid-cols-[minmax(0,1fr)_6rem_5rem_5rem_2.5rem] sm:items-end sm:gap-4"
          aria-hidden
        >
          <span className="text-xs font-medium text-foreground/56">Brand</span>
          <span className="text-xs font-medium text-foreground/56">Industry</span>
          <span className="text-xs font-medium text-foreground/56">Colors</span>
          <span className="text-xs font-medium text-foreground/56">Added</span>
          <span className="sr-only">Actions</span>
        </div>

        <ul className="divide-y divide-foreground/10">
          {brands.map((brand, index) => {
            const websiteLabel = brand.website ? getWebsiteLabel(brand.website) : null

            return (
              <li
                key={brand._id}
                className={cn('group', index % 2 === 1 && 'bg-foreground/[0.03]')}
              >
                <div className="flex items-center gap-4 py-5 sm:grid sm:grid-cols-[minmax(0,1fr)_6rem_5rem_5rem_2.5rem] sm:items-center sm:gap-4">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <BrandLogo logo={brand.logo} name={brand.name} />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium tracking-[-0.01em] text-foreground">
                        {brand.name}
                      </p>
                      {brand.description ? (
                        <p className="mt-1 line-clamp-1 text-sm text-foreground/56">
                          {brand.description}
                        </p>
                      ) : websiteLabel ? (
                        <p className="mt-1 line-clamp-1 text-sm text-foreground/56 sm:hidden">
                          {websiteLabel}
                        </p>
                      ) : brand.industry ? (
                        <p className="mt-1 text-sm text-foreground/56 md:hidden">
                          {brand.industry}
                        </p>
                      ) : null}
                      {websiteLabel && !brand.description ? (
                        <p className="mt-1 hidden text-sm text-foreground/44 sm:block md:hidden">
                          {websiteLabel}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="hidden min-w-0 md:block">
                    {brand.industry ? (
                      <p className="truncate text-sm text-foreground/56">{brand.industry}</p>
                    ) : (
                      <span className="text-sm text-foreground/44">—</span>
                    )}
                  </div>

                  <div className="hidden sm:block">
                    <ColorSwatches colors={brand.colors} />
                  </div>

                  <div className="hidden lg:block">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default text-sm text-foreground/56">
                          {formatRelativeTime(brand.createdAt)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">{formatDate(brand.createdAt)}</TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 sm:justify-end">
                    <div className="sm:hidden">
                      <ColorSwatches colors={brand.colors} />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="size-8 rounded-md text-foreground/56 hover:text-foreground"
                          aria-label={`Actions for ${brand.name}`}
                        >
                          <MoreHorizontalIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => setEditTarget(brand)}>
                          <PencilIcon />
                          Edit
                        </DropdownMenuItem>
                        {brand.website ? (
                          <DropdownMenuItem asChild>
                            <Link href={brand.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLinkIcon />
                              Visit website
                            </Link>
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(brand)}>
                          <Trash2Icon />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <BrandDialog
        open={editTarget !== null}
        onOpenChange={open => {
          if (!open) setEditTarget(null)
        }}
        workspaceId={workspaceId}
        brand={editTarget}
        onSaved={() => {
          setEditTarget(null)
          router.refresh()
        }}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete brand"
        description={
          deleteTarget
            ? `“${deleteTarget.name}” will be removed from this project. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete brand"
        isDeleting={isDeleting}
        onConfirm={() => void handleDelete()}
      />
    </>
  )
}
