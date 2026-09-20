'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { dashboardSurface, DashboardTableShell } from '@/components/dashboard'
import { PageHeader } from '@/components/headers/page-header'
import { CreateModelSheet } from '@/components/models/create-model-sheet'
import { ModelsTable } from '@/components/tables/models.table'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { deleteModel } from '@/services/models.service'
import type { AiCompany, Model } from '@socialista/types'
import { BoxIcon, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type ModelsPageClientProps = {
  models: Model[]
  companies: AiCompany[]
}

export function ModelsPageClient({ models, companies }: ModelsPageClientProps) {
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Model | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
    <div className="flex min-h-0 flex-1 flex-col">
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

      {models.length === 0 ? (
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
        <DashboardTableShell>
          <ModelsTable models={models} onEdit={openEditSheet} onDelete={setDeleteTarget} />
        </DashboardTableShell>
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
