import { PageHeader } from '@/components/headers/page-header'
import { MANAGER_SKILL_ROUTES } from '@/constants/app-routes'
import { getWorkspaceSkillCategories } from '@/services/skill-category.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { SkillCategoriesClient } from '../_components/skill-categories-client'

export default async function SkillCategoriesPage() {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Skill categories"
          breadcrumbs={[
            { label: 'Manager', href: '/manager' },
            { label: 'Skills', href: MANAGER_SKILL_ROUTES.LIST },
            { label: 'Categories' },
          ]}
        />
        <p className="text-sm text-muted-foreground">Select a workspace to manage categories.</p>
      </div>
    )
  }

  const result = await getWorkspaceSkillCategories(workspace.id, { limit: 100, sort: 'sortOrder' })
  const categories = result.data?.categories ?? []

  return <SkillCategoriesClient categories={categories} workspaceId={workspace.id} />
}
