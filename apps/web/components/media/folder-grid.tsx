'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { formatFileCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { FilesRoutePaths } from '@/constants/app-routes'
import type { CollectionResponse } from '@socialista/types'
import { FolderIcon, FolderOpenIcon, Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export const finderGridClassName =
  'grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8'

type FolderGridProps = {
  folders: CollectionResponse[]
  paths: FilesRoutePaths
  className?: string
  onDeleteFolder?: (folder: CollectionResponse) => void
}

export function FolderGrid({ folders, paths, className, onDeleteFolder }: FolderGridProps) {
  if (folders.length === 0) return null

  return (
    <div className={cn(finderGridClassName, className)}>
      {folders.map(folder => (
        <FolderGridItem key={folder._id} folder={folder} paths={paths} onDeleteFolder={onDeleteFolder} />
      ))}
    </div>
  )
}

function FolderGridItem({
  folder,
  paths,
  onDeleteFolder,
}: {
  folder: CollectionResponse
  paths: FilesRoutePaths
  onDeleteFolder?: (folder: CollectionResponse) => void
}) {
  const router = useRouter()
  const folderHref = paths.folder(folder._id)

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          onClick={() => router.push(folderHref)}
          className="group flex min-w-0 flex-col gap-1.5 text-left"
        >
          <div className="flex aspect-square items-center justify-center rounded-lg border border-border/60 bg-muted/40 transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
            <FolderIcon
              className="size-7 text-primary/80 transition-transform duration-200 group-hover:scale-105"
              strokeWidth={1.5}
            />
          </div>
          <div className="min-w-0 px-0.5 text-center">
            <p className="truncate text-[11px] font-medium leading-tight text-foreground">{folder.name}</p>
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{formatFileCount(folder.imagesCount)}</p>
          </div>
        </button>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-44">
        <ContextMenuItem onClick={() => router.push(folderHref)}>
          <FolderOpenIcon />
          Open folder
        </ContextMenuItem>
        {onDeleteFolder && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive" onClick={() => onDeleteFolder(folder)}>
              <Trash2Icon />
              Delete folder
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
