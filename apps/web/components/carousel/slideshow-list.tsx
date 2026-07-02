'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { SlideshowCardPreview } from '@/components/carousel/slideshow-card-preview'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/format'
import { deleteSlideshow, getWorkspaceSlideshows } from '@/services/slideshow.service'
import { useWorkspaceStore } from '@/store/workspace.store'
import type { SlideshowSummaryResponse } from '@socialista/types'
import { ImagesIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

function getWorkspaceId(workspace: { id?: string; _id?: string } | null | undefined): string | undefined {
  return workspace?.id ?? workspace?._id
}

function SlideshowCard({
  slideshow,
  onDelete,
}: {
  slideshow: SlideshowSummaryResponse
  onDelete: (slideshow: SlideshowSummaryResponse) => void
}) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/dashboard/studio/slideshows/${slideshow.id}`} className="relative block">
        <SlideshowCardPreview slide={slideshow.previewSlide} canvas={slideshow.canvas} />
        <span className="absolute right-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {slideshow.status}
        </span>
      </Link>
      <CardHeader className="gap-1 p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="truncate text-sm">
              <Link href={`/dashboard/studio/slideshows/${slideshow.id}`} className="hover:underline">
                {slideshow.name}
              </Link>
            </CardTitle>
            <CardDescription className="text-xs">
              Updated {formatRelativeTime(slideshow.updatedAt)}
            </CardDescription>
          </div>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label={`Delete ${slideshow.name}`}
            onClick={() => onDelete(slideshow)}
          >
            <Trash2Icon />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <p className="text-xs text-muted-foreground">
          {slideshow.slideCount} slide{slideshow.slideCount === 1 ? '' : 's'} · {slideshow.canvas.width}×
          {slideshow.canvas.height}
        </p>
      </CardContent>
    </Card>
  )
}

export function SlideshowList() {
  const workspace = useWorkspaceStore(s => s.currentWorkspace)
  const workspaceId = getWorkspaceId(workspace)
  const [slideshows, setSlideshows] = useState<SlideshowSummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SlideshowSummaryResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadSlideshows = useCallback(async () => {
    if (!workspaceId) {
      setSlideshows([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const response = await getWorkspaceSlideshows(workspaceId, 'draft')
    if (!response.success || !response.data) {
      setError(response.message ?? 'Failed to load slideshows')
      setSlideshows([])
      setIsLoading(false)
      return
    }

    setSlideshows(response.data.slideshows)
    setIsLoading(false)
  }, [workspaceId])

  useEffect(() => {
    void loadSlideshows()
  }, [loadSlideshows])

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)

    const response = await deleteSlideshow(deleteTarget.id)
    setIsDeleting(false)

    if (!response.success) {
      toast.error(response.message ?? 'Failed to delete slideshow')
      return
    }

    toast.success('Slideshow deleted')
    setDeleteTarget(null)
    void loadSlideshows()
  }

  if (!workspace) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Select a workspace to view slideshows.
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <header className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ImagesIcon className="size-4" />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Slideshows</h1>
            <p className="truncate text-xs text-muted-foreground">Drafts saved in {workspace.name}</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/dashboard/studio/slideshows/create">
            <PlusIcon />
            New slideshow
          </Link>
        </Button>
      </header>

      {isLoading ? (
        <LoadingState message="Loading slideshows…" />
      ) : error ? (
        <ErrorState
          title={error}
          description="Try again or refresh the page."
          action={
            <Button size="sm" variant="outline" onClick={() => void loadSlideshows()}>
              Retry
            </Button>
          }
        />
      ) : slideshows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/20 p-10 text-center">
          <ImagesIcon className="size-10 text-muted-foreground/60" />
          <div>
            <p className="font-medium">No slideshow drafts yet</p>
            <p className="text-sm text-muted-foreground">Create a slideshow to start editing and saving drafts.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/studio/slideshows/create">
              <PlusIcon />
              Create your first slideshow
            </Link>
          </Button>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {slideshows.map(slideshow => (
              <SlideshowCard key={slideshow.id} slideshow={slideshow} onDelete={setDeleteTarget} />
            ))}
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteTarget != null}
        onOpenChange={open => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete slideshow?"
        description={
          deleteTarget
            ? `“${deleteTarget.name}” will be permanently removed. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete slideshow"
        isDeleting={isDeleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}
