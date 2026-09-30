'use client'

import { InfluencerCard } from '@/components/cards/influencer-card'
import { EmptyState } from '@/components/common/empty-state'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import type { Filter } from '@/components/reui/filters'
import { Button } from '@/components/ui/button'
import { MANAGER_ROUTES } from '@/constants/app-routes'
import { useManagerInfluencerFilters } from '@/hooks/use-manager-influencer-filters'
import { hasActiveInfluencerFilters } from '@/lib/manager-influencer-filters'
import { deleteLibraryInfluencer } from '@/services/influencer.service'
import type { Influencer } from '@socialista/types'
import { PlusIcon, UserRoundIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

type InfluencersListProps = {
  influencers: Influencer[]
  filters: Filter<string>[]
}

function InfluencersEmptyState({ hasFilters }: { hasFilters: boolean }) {
  const { isPending, clearFilters } = useManagerInfluencerFilters()

  return (
    <EmptyState
      minHeight="lg"
      icon={UserRoundIcon}
      title={hasFilters ? 'No matching influencers' : 'No influencers yet'}
      description={
        hasFilters
          ? 'Try adjusting filters or search.'
          : 'Create a public library influencer for users to pick in studio.'
      }
      action={
        <>
          {hasFilters ? (
            <Button type="button" variant="outline" size="sm" onClick={clearFilters} disabled={isPending}>
              Clear filters
            </Button>
          ) : null}
          <Button asChild size="sm">
            <Link href={MANAGER_ROUTES.INFLUENCER_CREATE}>
              <PlusIcon className="size-3.5" />
              Create public
            </Link>
          </Button>
        </>
      }
    />
  )
}

export function InfluencersList({ influencers, filters }: InfluencersListProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<Influencer | null>(null)
  const hasFilters = hasActiveInfluencerFilters(filters)

  if (influencers.length === 0) {
    return <InfluencersEmptyState hasFilters={hasFilters} />
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    startTransition(async () => {
      const response = await deleteLibraryInfluencer(deleteTarget._id)
      if (!response.success) {
        toast.error(response.message ?? 'Failed to delete influencer')
        return
      }
      toast.success('Influencer deleted')
      setDeleteTarget(null)
      router.refresh()
    })
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
        {influencers.map(influencer => (
          <InfluencerCard
            key={influencer._id}
            influencer={influencer}
            href={MANAGER_ROUTES.influencer(influencer._id)}
            showVisibility
            onDelete={
              influencer.workspaceId === null
                ? item => {
                    setDeleteTarget(item)
                  }
                : undefined
            }
          />
        ))}
      </div>

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={open => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete public influencer?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed from the public library. This cannot be undone.`
            : undefined
        }
        onConfirm={handleDeleteConfirm}
        isDeleting={pending}
      />
    </>
  )
}
