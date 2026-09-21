'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { deleteStaticAdTemplateCategory } from '@/services/static-ad-templates.service'
import type { StaticAdTemplateCategoryDto } from '@socialista/types'
import { FolderTreeIcon, Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type StaticAdTemplateCategoriesGridProps = {
  categories: StaticAdTemplateCategoryDto[]
}

export function StaticAdTemplateCategoriesGrid({ categories }: StaticAdTemplateCategoriesGridProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<StaticAdTemplateCategoryDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      const result = await deleteStaticAdTemplateCategory(deleteTarget._id)
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
        <EmptyState
          minHeight="lg"
          icon={FolderTreeIcon}
          title="No categories yet"
          description="Create a category so static ad templates can be filtered in the studio."
          variant="hero"
          iconClassName={dashboardSurface.emptyIcon}
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map(category => (
            <div
              key={category._id}
              className="group flex items-center justify-between gap-2 rounded-lg border border-transparent p-1.5 transition-colors duration-150 hover:border-border/55 hover:bg-muted/30"
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
            ? `"${deleteTarget.name}" will be hidden from gallery filters. Existing templates keep the category name.`
            : 'This category will be hidden from filters.'
        }
        confirmLabel="Delete category"
        isDeleting={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
      />
    </section>
  )
}
