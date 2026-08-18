'use client'

import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/headers/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MANAGER_SKILL_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import type { SkillCategory } from '@socialista/types'
import { FolderTreeIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { SkillCategorySheet } from './skill-category-sheet'
import { isMutableCategory } from './skill-utils'

type SkillCategoriesClientProps = {
  categories: SkillCategory[]
  workspaceId: string
}

export function SkillCategoriesClient({ categories, workspaceId }: SkillCategoriesClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null)

  const openCreate = () => {
    setEditingCategory(null)
    setSheetOpen(true)
  }

  const openEdit = (category: SkillCategory) => {
    if (!isMutableCategory(category)) return
    setEditingCategory(category)
    setSheetOpen(true)
  }

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open)
    if (!open) setEditingCategory(null)
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Skill categories"
        description="Organize skills into themes the studio can browse."
        breadcrumbs={[
          { label: 'Manager', href: '/manager' },
          { label: 'Skills', href: MANAGER_SKILL_ROUTES.LIST },
          { label: 'Categories' },
        ]}
        actions={
          <Button size="sm" className="h-8 gap-1.5 rounded-lg" onClick={openCreate}>
            <PlusIcon className="size-3.5" />
            New category
          </Button>
        }
      />

      {categories.length === 0 ? (
        <EmptyState
          minHeight="lg"
          icon={FolderTreeIcon}
          title="No categories yet"
          description="Create a category before adding skills."
          action={
            <Button size="sm" onClick={openCreate}>
              <PlusIcon className="size-3.5" />
              Add category
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(category => {
            const mutable = isMutableCategory(category)
            const className =
              'flex w-full items-start gap-3 rounded-xl border border-border/70 bg-background p-4 text-left'

            const body = (
              <>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">
                  {category.icon || '✦'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{category.name}</p>
                    {category.status === 'archived' ? <Badge variant="secondary">Archived</Badge> : null}
                    {category.source === 'system' ? <Badge variant="outline">System</Badge> : null}
                  </div>
                  {category.description ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {category.description}
                    </p>
                  ) : null}
                </div>
              </>
            )

            if (!mutable) {
              return (
                <div key={category._id} className={className}>
                  {body}
                </div>
              )
            }

            return (
              <button
                key={category._id}
                type="button"
                onClick={() => openEdit(category)}
                className={cn(className, 'transition-colors hover:bg-muted/40')}
              >
                {body}
              </button>
            )
          })}
        </div>
      )}

      <SkillCategorySheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        workspaceId={workspaceId}
        category={editingCategory}
      />
    </div>
  )
}
