import { PageHeader } from '@/components/headers/page-header'
import { Button } from '@/components/ui/button'
import { MANAGER_SKILL_ROUTES } from '@/constants/app-routes'
import { getWorkspaceSkillCategories } from '@/services/skill-category.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import Link from 'next/link'
import { SkillForm } from '../_components/skill-form'

export default async function CreateSkillPage() {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Create skill"
          breadcrumbs={[
            { label: 'Manager', href: '/manager' },
            { label: 'Skills', href: MANAGER_SKILL_ROUTES.LIST },
            { label: 'Create' },
          ]}
          backHref={MANAGER_SKILL_ROUTES.LIST}
        />
        <p className="text-sm text-muted-foreground">Select a workspace to create a skill.</p>
      </div>
    )
  }

  const categoriesResult = await getWorkspaceSkillCategories(workspace.id, { limit: 100, status: 'active' })
  const categories = categoriesResult.data?.categories ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Create skill"
        breadcrumbs={[
          { label: 'Manager', href: '/manager' },
          { label: 'Skills', href: MANAGER_SKILL_ROUTES.LIST },
          { label: 'Create' },
        ]}
        backHref={MANAGER_SKILL_ROUTES.LIST}
      />

      {categories.length === 0 ? (
        <div className="mx-auto max-w-7xl py-16 text-center">
          <p className="text-sm font-medium tracking-[-0.01em]">Create a category first</p>
          <p className="mt-1 text-[13px] text-muted-foreground">Skills need a category before they can be saved.</p>
          <Button asChild size="sm" variant="outline" className="mt-5">
            <Link href={MANAGER_SKILL_ROUTES.CATEGORIES}>Go to categories</Link>
          </Button>
        </div>
      ) : (
        <SkillForm workspaceId={workspace.id} categories={categories} />
      )}
    </div>
  )
}
