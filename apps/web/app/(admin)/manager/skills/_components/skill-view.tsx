'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { PageHeader } from '@/components/headers/page-header'
import { Button } from '@/components/ui/button'
import { MANAGER_SKILL_ROUTES } from '@/constants/app-routes'
import { deleteSkill } from '@/services/skill.service'
import type { Skill } from '@socialista/types'
import { PencilIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { SkillBindingBadge, SkillSourceBadge, SkillStatusBadge } from './skill-badges'
import { isMutableSkill } from './skill-utils'

type SkillViewProps = {
  skill: Skill
}

export function SkillView({ skill }: SkillViewProps) {
  const router = useRouter()
  const mutable = isMutableSkill(skill)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteSkill(skill._id)
      if (!result.success) {
        toast.error(result.message ?? 'Failed to delete skill')
        return
      }

      toast.success('Skill deleted')
      router.push(MANAGER_SKILL_ROUTES.LIST)
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
        title={skill.name}
        description={skill.description || undefined}
        breadcrumbs={[
          { label: 'Manager', href: '/manager' },
          { label: 'Skills', href: MANAGER_SKILL_ROUTES.LIST },
          { label: skill.name },
        ]}
        backHref={MANAGER_SKILL_ROUTES.LIST}
        actions={
          mutable ? (
            <>
              <Button asChild size="sm" variant="outline" className="h-8 rounded-lg">
                <Link href={MANAGER_SKILL_ROUTES.edit(skill._id)}>
                  <PencilIcon className="size-3.5" />
                  Edit
                </Link>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="h-8 rounded-lg"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2Icon className="size-3.5" />
                Delete
              </Button>
            </>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {skill.icon ? <span className="mr-1 text-lg">{skill.icon}</span> : null}
        <SkillBindingBadge binding={skill.binding} />
        <SkillStatusBadge status={skill.status} />
        <SkillSourceBadge source={skill.source} />
        {skill.category?.name ? (
          <span className="text-xs text-muted-foreground">{skill.category.name}</span>
        ) : null}
      </div>

      {!mutable ? (
        <p className="text-xs text-muted-foreground">System skills are read-only.</p>
      ) : null}

      {skill.variables.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skill.variables.map(variable => (
            <span
              key={variable.key}
              className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              {`{{${variable.key}}}`}
            </span>
          ))}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border/70 bg-card px-6 py-5 sm:px-8 sm:py-6">
        <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground">{skill.content}</p>
      </div>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={open => {
          if (!open && !isDeleting) setDeleteOpen(false)
        }}
        title="Delete skill?"
        description={`"${skill.name}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete skill"
        isDeleting={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  )
}
