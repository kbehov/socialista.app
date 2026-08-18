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
import { MANAGER_SKILL_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { deleteSkill } from '@/services/skill.service'
import type { Skill } from '@socialista/types'
import { MoreHorizontalIcon, PencilIcon, SparklesIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { SkillBindingBadge, SkillSourceBadge, SkillStatusBadge } from './skill-badges'
import { isMutableSkill } from './skill-utils'

type SkillsListProps = {
  skills: Skill[]
  hasFilters?: boolean
}

export function SkillsList({ skills, hasFilters = false }: SkillsListProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null)
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
        icon={SparklesIcon}
        title={hasFilters ? 'No matching skills' : 'No skills yet'}
        description={
          hasFilters
            ? 'Try another category, or create a skill in this one.'
            : 'Write instructions in markdown and attach them to a category.'
        }
        action={
          <Button asChild size="sm">
            <Link href={MANAGER_SKILL_ROUTES.CREATE}>
              <SparklesIcon className="size-3.5" />
              New skill
            </Link>
          </Button>
        }
      />
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border/70">
        <ul className="divide-y divide-border/70">
          {skills.map(skill => {
            const mutable = isMutableSkill(skill)
            const categoryName = skill.category?.name

            return (
              <li key={skill._id}>
                <div className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40">
                  <Link
                    href={MANAGER_SKILL_ROUTES.skill(skill._id)}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm">
                      {skill.icon || '✦'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{skill.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {categoryName ? `${categoryName}` : 'Uncategorized'}
                        {skill.description ? ` · ${skill.description}` : ''}
                      </p>
                    </div>
                  </Link>

                  <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                    <SkillBindingBadge binding={skill.binding} />
                    <SkillStatusBadge status={skill.status} />
                    <SkillSourceBadge source={skill.source} />
                  </div>

                  {mutable ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className={cn(
                            'shrink-0 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100',
                          )}
                          aria-label={`Actions for ${skill.name}`}
                        >
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem asChild>
                          <Link href={MANAGER_SKILL_ROUTES.edit(skill._id)}>
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
                  ) : (
                    <div className="size-6 shrink-0" />
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>

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
