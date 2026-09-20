'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { deleteStaticAdTemplate } from '@/services/static-ad-templates.service'
import type { StaticAdTemplateDto } from '@socialista/types'
import { LayoutTemplateIcon, Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type StaticAdTemplatesListProps = {
  templates: StaticAdTemplateDto[]
  hasFilters: boolean
}

export function StaticAdTemplatesList({ templates, hasFilters }: StaticAdTemplatesListProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<StaticAdTemplateDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      const result = await deleteStaticAdTemplate(deleteTarget._id)
      if (!result.success) {
        toast.error(result.message ?? 'Failed to delete template')
        return
      }
      toast.success('Template deleted')
      setDeleteTarget(null)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (templates.length === 0) {
    return (
      <EmptyState
        minHeight="lg"
        icon={LayoutTemplateIcon}
        title={hasFilters ? 'No matching templates' : 'No templates yet'}
        description={
          hasFilters
            ? 'Try a different category filter.'
            : 'Use New to upload a preview and pick a category.'
        }
      />
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
        {templates.map(template => {
          const label = template.name ?? 'Untitled template'
          return (
            <article key={template._id} className="group/card">
              <div className="relative">
                <div
                  className={cn(
                    'relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-black/[0.04]',
                    'ring-1 ring-black/8 dark:bg-white/[0.04] dark:ring-white/10',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={template.imageUrl} alt="" className="size-full object-cover" loading="lazy" />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-xs"
                  aria-label={`Delete ${label}`}
                  className={cn(
                    'absolute top-2 right-2 z-10 rounded-lg shadow-xs',
                    'opacity-100 pointer-fine:opacity-0',
                    'pointer-fine:group-hover/card:opacity-100 pointer-fine:group-focus-within/card:opacity-100',
                  )}
                  onClick={() => setDeleteTarget(template)}
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              </div>
              <p className="mt-2 truncate px-0.5 text-[13px] font-medium leading-snug tracking-[-0.015em] text-foreground">
                {label}
              </p>
              {template.categories.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1 px-0.5">
                  {template.categories.map(category => (
                    <Badge key={category} variant="outline" className="h-5 max-w-full truncate">
                      {category}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </article>
          )
        })}
      </div>

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open && !isDeleting) {
            setDeleteTarget(null)
          }
        }}
        title="Delete template?"
        description={
          deleteTarget
            ? `"${deleteTarget.name ?? 'Untitled template'}" will be removed from the static ads gallery.`
            : 'This template will be removed from the static ads gallery.'
        }
        confirmLabel="Delete template"
        isDeleting={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
      />
    </>
  )
}
