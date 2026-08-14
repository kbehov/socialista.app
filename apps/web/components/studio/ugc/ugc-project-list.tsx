'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { ErrorState } from '@/components/common/error-state'
import { dashboardSurface } from '@/components/dashboard'
import { PageHeader } from '@/components/headers/page-header'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { createUgcProject, deleteUgcProject, getWorkspaceUgcProjects } from '@/services/ugc-project.service'
import { formatRelativeTime } from '@/utils/format'
import type { UgcProjectSummary } from '@socialista/types'
import { Loader2Icon, PlusIcon, SmartphoneIcon, Trash2Icon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

type UgcProjectListProps = {
  workspaceId: string
  workspaceName: string
  initialProjects: UgcProjectSummary[]
  initialError?: string | null
}

export function UgcProjectList({
  workspaceId,
  workspaceName,
  initialProjects,
  initialError = null,
}: UgcProjectListProps) {
  const router = useRouter()
  const [projects, setProjects] = useState(initialProjects)
  const [error, setError] = useState(initialError)
  const [creating, startCreate] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<UgcProjectSummary | null>(null)
  const [isDeleting, startDelete] = useTransition()

  const handleCreate = () => {
    startCreate(async () => {
      const response = await createUgcProject({ workspaceId })
      if (!response.success || !response.data?.project) {
        toast.error(response.message ?? 'Could not create a UGC ad')
        return
      }
      router.push(DASHBOARD_ROUTES.STUDIO.ugcProject(response.data.project.id))
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    startDelete(async () => {
      const response = await deleteUgcProject(deleteTarget.id)
      if (!response.success) {
        toast.error(response.message ?? 'Delete failed')
        return
      }
      setProjects(current => current.filter(project => project.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast.success('Deleted')
    })
  }

  const createAction = (
    <Button size="sm" className={dashboardSurface.createCta} disabled={creating} onClick={handleCreate}>
      {creating ? <Loader2Icon className="size-4 animate-spin" /> : <PlusIcon className="size-4" strokeWidth={1.75} />}
      New UGC ad
    </Button>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <PageHeader
        title="UGC ads"
        description={`${projects.length === 1 ? '1 project' : `${projects.length} projects`} in ${workspaceName}`}
        actions={createAction}
      />

      {error ? (
        <ErrorState
          title={error}
          description="Try again or refresh the page."
          className="flex-1 rounded-xl"
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                void getWorkspaceUgcProjects(workspaceId).then(response => {
                  if (!response.success) {
                    setError(response.message ?? 'Failed to load')
                    return
                  }
                  setError(null)
                  setProjects(response.data?.projects ?? [])
                })
              }}
            >
              Retry
            </Button>
          }
        />
      ) : projects.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 px-6 py-16 text-center">
          <span className={cn('mb-4 flex items-center justify-center', dashboardSurface.emptyIcon)}>
            <SmartphoneIcon className="text-muted-foreground" strokeWidth={1.5} />
          </span>
          <p className="text-sm font-semibold tracking-tight">Make your first UGC ad</p>
          <p className="mt-1.5 max-w-[18rem] text-xs leading-relaxed text-muted-foreground">
            Drop a product photo → pick a clip type → generate.
          </p>
          <div className="mt-5">{createAction}</div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {projects.map(project => {
              const href = DASHBOARD_ROUTES.STUDIO.ugcProject(project.id)
              return (
                <article key={project.id} className="group/card relative">
                  <Link href={href} className="block">
                    <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-muted ring-1 ring-border/60 transition group-hover/card:shadow-md">
                      {project.previewImageUrl ? (
                        <Image
                          alt=""
                          className="object-cover"
                          fill
                          sizes="220px"
                          src={project.previewImageUrl}
                          unoptimized
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                          <SmartphoneIcon className="size-6" strokeWidth={1.5} />
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="mt-2.5 space-y-1 px-0.5">
                    <Link href={href} className="block truncate text-sm font-medium tracking-tight">
                      {project.name}
                    </Link>
                    <p className="text-[11px] text-muted-foreground">
                      {project.clipCount === 1 ? '1 clip' : `${project.clipCount} clips`} ·{' '}
                      {formatRelativeTime(project.updatedAt)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    className="absolute top-2 right-2 z-10 size-8 rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm group-hover/card:opacity-100 hover:bg-black/55 hover:text-white"
                    aria-label={`Delete ${project.name}`}
                    onClick={event => {
                      event.preventDefault()
                      setDeleteTarget(project)
                    }}
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </article>
              )
            })}
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteTarget != null}
        onOpenChange={open => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete UGC ad?"
        description={deleteTarget ? `“${deleteTarget.name}” will be removed.` : ''}
        confirmLabel="Delete"
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
