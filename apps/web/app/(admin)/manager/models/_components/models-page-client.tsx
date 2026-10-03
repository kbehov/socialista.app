'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { SmartPagination } from '@/components/common/smart-pagination'
import { dashboardSurface, DashboardTableShell } from '@/components/dashboard'
import { PageHeader } from '@/components/headers/page-header'
import { CreateModelSheet } from '@/components/models/create-model-sheet'
import type { Filter } from '@/components/reui/filters'
import { ModelsTable } from '@/components/tables/models.table'
import { Button } from '@/components/ui/button'
import { applyModelFilters, hasActiveModelFilters } from '@/lib/manager-model-filters'
import { cn } from '@/lib/utils'
import { deleteModel } from '@/services/models.service'
import type { AiCompany, MetaResponse, Model } from '@socialista/types'
import { BoxIcon, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { ModelsToolbar } from './models-toolbar'

type ModelsPageClientProps = {
  models: Model[]
  companies: AiCompany[]
  meta: MetaResponse
}

export function ModelsPageClient({ models, companies, meta }: ModelsPageClientProps) {
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Model | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [filters, setFilters] = useState<Filter<string>[]>([])

  const filteredModels = useMemo(() => applyModelFilters(models, filters), [filters, models])
  const hasFilters = hasActiveModelFilters(filters)

  const openCreateSheet = () => {
    setEditingModel(null)
    setSheetOpen(true)
  }

  const openEditSheet = (model: Model) => {
    setEditingModel(model)
    setSheetOpen(true)
  }

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open)
    if (!open) {
      setEditingModel(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      const result = await deleteModel(deleteTarget._id)

      if (!result.success) {
        toast.error(result.message ?? 'Failed to delete model')
        return
      }

      toast.success('Model deleted')
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PageHeader
        title="Models"
        description="Manage AI models and their pricing."
        breadcrumbs={[{ label: 'Manager', href: '/manager' }, { label: 'Models' }]}
        actions={
          <Button size="sm" className={cn(dashboardSurface.createCta, 'gap-1.5')} onClick={openCreateSheet}>
            <PlusIcon className="size-3.5" />
            New model
          </Button>
        }
      />

      {meta.total === 0 ? (
        <EmptyState
          minHeight="lg"
          icon={BoxIcon}
          title="No models yet"
          description="Add your first AI model to configure generation pricing."
          action={
            <Button size="sm" onClick={openCreateSheet}>
              <PlusIcon className="size-3.5" />
              Add model
            </Button>
          }
        />
      ) : (
        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
          <ModelsToolbar
            models={models}
            companies={companies}
            filters={filters}
            onFiltersChange={setFilters}
          />

          {filteredModels.length === 0 ? (
            <EmptyState
              minHeight="md"
              icon={BoxIcon}
              title="No matching models"
              description="Try adjusting or clearing your filters."
              action={
                hasFilters ? (
                  <Button size="sm" variant="outline" onClick={() => setFilters([])}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <DashboardTableShell className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <ModelsTable
                models={filteredModels}
                onEdit={openEditSheet}
                onDelete={setDeleteTarget}
              />
            </DashboardTableShell>
          )}

          <SmartPagination meta={meta} className="shrink-0" />
        </section>
      )}

      <CreateModelSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        model={editingModel}
        companies={companies}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open && !isDeleting) {
            setDeleteTarget(null)
          }
        }}
        title="Delete model?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed. This action cannot be undone.`
            : 'This model will be permanently removed. This action cannot be undone.'
        }
        confirmLabel="Delete model"
        isDeleting={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  )
}
