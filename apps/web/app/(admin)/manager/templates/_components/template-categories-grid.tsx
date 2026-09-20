'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { Button } from '@/components/ui/button'
import { deleteStudioTemplateCategory } from '@/services/studio-templates.service'
import type { StudioTemplateCategoryDto } from '@socialista/types'
import { Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type TemplateCategoriesGridProps = {
  categories: StudioTemplateCategoryDto[]
}

export function TemplateCategoriesGrid({ categories }: TemplateCategoriesGridProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<StudioTemplateCategoryDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      const result = await deleteStudioTemplateCategory(deleteTarget._id)
      if (!result.success) {
        toast.error(result.message ?? 'Failed to delete category')
        return
      }
      toast.success('Category deleted')
      setDeleteTarget(null)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="flex flex-col gap-3">
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No categories yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map(category => (
            <div
              key={category._id}
              className="group flex items-center justify-between gap-2 rounded-lg border border-transparent p-1 transition-colors hover:border-border"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{category.name}</div>
                <div className="text-xs text-muted-foreground">
                  {category.templatesCount} {category.templatesCount === 1 ? 'template' : 'templates'}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Delete ${category.name}`}
                className="opacity-100 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
                onClick={() => setDeleteTarget(category)}
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open && !isDeleting) {
            setDeleteTarget(null)
          }
        }}
        title="Delete category?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be hidden from image and video filters. Existing templates keep the category name.`
            : 'This category will be hidden from filters.'
        }
        confirmLabel="Delete category"
        isDeleting={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
      />
    </section>
  )
}
