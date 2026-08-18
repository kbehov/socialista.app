import { PageHeader } from '@/components/headers/page-header'
import { MANAGER_SKILL_ROUTES } from '@/constants/app-routes'
import { getWorkspaceSkillCategories } from '@/services/skill-category.service'
import { getSkill } from '@/services/skill.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { notFound, redirect } from 'next/navigation'
import { SkillForm } from '../../_components/skill-form'
import { isMutableSkill } from '../../_components/skill-utils'

export default async function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [workspace, skillResult] = await Promise.all([getCurrentWorkspace(), getSkill(id)])
  const skill = skillResult.data?.skill

  if (!skill) {
    notFound()
  }

  if (!isMutableSkill(skill)) {
    redirect(MANAGER_SKILL_ROUTES.skill(skill._id))
  }

  if (!workspace) {
    redirect(MANAGER_SKILL_ROUTES.LIST)
  }

  const categoriesResult = await getWorkspaceSkillCategories(workspace.id, { limit: 100 })
  const categories = (categoriesResult.data?.categories ?? []).filter(
    category => category.status === 'active' || category._id === skill.categoryId,
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Edit skill"
        breadcrumbs={[
          { label: 'Manager', href: '/manager' },
          { label: 'Skills', href: MANAGER_SKILL_ROUTES.LIST },
          { label: skill.name, href: MANAGER_SKILL_ROUTES.skill(skill._id) },
          { label: 'Edit' },
        ]}
        backHref={MANAGER_SKILL_ROUTES.skill(skill._id)}
      />

      <SkillForm workspaceId={workspace.id} categories={categories} skill={skill} />
    </div>
  )
}
