'use client'

import { BrandDialog } from '@/components/brands/brand-dialog'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { dashboardSurface, DashboardTableShell } from '@/components/dashboard'
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
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold tracking-tight text-muted-foreground ring-1 ring-border/60">
        {getInitials(name)}
      </div>
    )
  }

  return (
    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt="" className="size-full object-cover" />
      <span className="sr-only">{name}</span>
    </div>
  )
}

function ColorSwatches({ colors }: { colors: string[] }) {
  if (colors.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  const visible = colors.slice(0, 5)
  const extra = colors.length - visible.length

  return (
    <div className="flex items-center gap-1">
      {visible.map(color => (
        <span
          key={color}
          className="size-4 rounded-full ring-1 ring-black/10 dark:ring-white/15"
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
      {extra > 0 ? <span className="pl-0.5 text-[10px] text-muted-foreground">+{extra}</span> : null}
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
      <DashboardTableShell className={className}>
        <Table>
          <TableHeader>
            <TableRow className={cn(dashboardSurface.tableHead, 'hover:bg-muted/30')}>
              <TableHead className="h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Brand
              </TableHead>
              <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase md:table-cell">
                Industry
              </TableHead>
              <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:table-cell">
                Colors
              </TableHead>
              <TableHead className="hidden h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell">
                Added
              </TableHead>
              <TableHead className="h-11 w-[52px] px-2" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map(brand => {
              const websiteLabel = brand.website ? getWebsiteLabel(brand.website) : null

              return (
                <TableRow key={brand._id} className="group border-border/50 hover:bg-muted/25">
                  <TableCell className="px-4 py-3.5 whitespace-normal">
                    <div className="flex min-w-0 items-center gap-3">
                      <BrandLogo logo={brand.logo} name={brand.name} />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium tracking-tight text-foreground">{brand.name}</p>
                        {brand.description ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{brand.description}</p>
                        ) : websiteLabel ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">{websiteLabel}</p>
                        ) : brand.industry ? (
                          <p className="mt-0.5 text-xs text-muted-foreground md:hidden">{brand.industry}</p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden px-4 py-3.5 md:table-cell">
                    {brand.industry ? (
                      <Badge variant="outline" className="max-w-[180px] truncate font-normal">
                        {brand.industry}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell className="hidden px-4 py-3.5 sm:table-cell">
                    <ColorSwatches colors={brand.colors} />
                  </TableCell>

                  <TableCell className="hidden px-4 py-3.5 lg:table-cell">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default text-xs text-muted-foreground">
                          {formatRelativeTime(brand.createdAt)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">{formatDate(brand.createdAt)}</TooltipContent>
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
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </DashboardTableShell>

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
