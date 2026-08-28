'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/headers/page-header'
import { CreateAiCompanySheet } from '@/components/models/create-ai-company-sheet'
import { AiCompaniesTable } from '@/components/tables/ai-companies.table'
import { Button } from '@/components/ui/button'
import { deleteAiCompany } from '@/services/ai-company.service'
import type { AiCompany } from '@socialista/types'
import { Building2Icon, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type AiCompaniesPageClientProps = {
  companies: AiCompany[]
}

export function AiCompaniesPageClient({ companies }: AiCompaniesPageClientProps) {
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<AiCompany | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AiCompany | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const openCreateSheet = () => {
    setEditingCompany(null)
    setSheetOpen(true)
  }

  const openEditSheet = (company: AiCompany) => {
    setEditingCompany(company)
    setSheetOpen(true)
  }

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open)
    if (!open) {
      setEditingCompany(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      const result = await deleteAiCompany(deleteTarget._id)

      if (!result.success) {
        toast.error(result.message ?? 'Failed to delete company')
        return
      }

      toast.success('Company deleted')
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
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Companies"
        description="AI labs and companies used for model logos."
        breadcrumbs={[
          { label: 'Manager', href: '/manager' },
          { label: 'Models', href: '/manager/models' },
          { label: 'Companies' },
        ]}
        actions={
          <Button size="sm" className="h-8 gap-1.5 rounded-lg" onClick={openCreateSheet}>
            <PlusIcon className="size-3.5" />
            New company
          </Button>
        }
      />

      {companies.length === 0 ? (
        <EmptyState
          minHeight="lg"
          icon={Building2Icon}
          title="No companies yet"
          description="Add OpenAI, Google, xAI, and other labs so their logos appear in the model selector."
          action={
            <Button size="sm" onClick={openCreateSheet}>
              <PlusIcon className="size-3.5" />
              Add company
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border border-border">
          <AiCompaniesTable companies={companies} onEdit={openEditSheet} onDelete={setDeleteTarget} />
        </div>
      )}

      <CreateAiCompanySheet open={sheetOpen} onOpenChange={handleSheetOpenChange} company={editingCompany} />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open && !isDeleting) {
            setDeleteTarget(null)
          }
        }}
        title="Delete company?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed. Models that still use it must be unassigned first.`
            : 'This company will be permanently removed. This action cannot be undone.'
        }
        confirmLabel="Delete company"
        isDeleting={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  )
}
