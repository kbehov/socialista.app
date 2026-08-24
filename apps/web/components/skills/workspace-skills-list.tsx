'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreateSkillMenu } from '@/components/skills/create-skill-menu'
import { SkillsTable } from '@/components/skills/skills-table'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useSkillsSearch } from '@/hooks/use-skills-search'
import type { SkillListItem } from '@/lib/skills/skill-list'
import { cn } from '@/lib/utils'
import { deleteSkill } from '@/services/skill.service'
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type WorkspaceSkillsListProps = {
  skills: SkillListItem[]
  hasQuery?: boolean
}

export function WorkspaceSkillsList({ skills, hasQuery = false }: WorkspaceSkillsListProps) {
  const router = useRouter()
  const { clearSearch } = useSkillsSearch()
  const [deleteTarget, setDeleteTarget] = useState<SkillListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      const result = await deleteSkill(deleteTarget._id)
      if (!result.success) {
        toast.error(result.message ?? 'Failed to delete skill')
        return
      }

      toast.success('Skill deleted')
      setDeleteTarget(null)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (skills.length === 0) {
    return (
      <EmptyState
        minHeight="lg"
        variant="ghost"
        className="flex-1 py-16"
        title={hasQuery ? 'No matching skills' : 'No skills yet'}
        description={
          hasQuery
            ? 'Try a different search, or create a new skill.'
            : undefined
        }
        action={
          hasQuery ? (
            <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={clearSearch}>
              Clear search
            </Button>
          ) : (
            <CreateSkillMenu label="Create skill" variant="outline" className="rounded-lg" />
          )
        }
      />
    )
  }

  return (
    <>
      <SkillsTable
        skills={skills}
        rowHref={skill => DASHBOARD_ROUTES.editSkill(skill._id)}
        renderActions={skill => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className={cn(
                  'relative z-20 size-6 shrink-0 rounded-md text-muted-foreground',
                  'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100',
                  'hover:bg-muted/80 hover:text-foreground',
                )}
                aria-label={`Actions for ${skill.name}`}
              >
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href={DASHBOARD_ROUTES.editSkill(skill._id)}>
                  <PencilIcon />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteTarget(skill)}>
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open && !isDeleting) setDeleteTarget(null)
        }}
        title="Delete skill?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed. This cannot be undone.`
            : 'This skill will be permanently removed. This cannot be undone.'
        }
        confirmLabel="Delete skill"
        isDeleting={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
      />
    </>
  )
}
