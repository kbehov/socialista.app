import { WorkspaceSkillForm } from '@/components/skills/workspace-skill-form'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { getSkill } from '@/services/skill.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { notFound, redirect } from 'next/navigation'

export default async function EditWorkspaceSkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [workspace, skillResult] = await Promise.all([getCurrentWorkspace(), getSkill(id)])
  const skill = skillResult.data?.skill

  if (!skill) {
    notFound()
  }

  if (!workspace || skill.workspaceId !== workspace.id) {
    redirect(DASHBOARD_ROUTES.SKILLS)
  }

  return <WorkspaceSkillForm workspaceId={workspace.id} skill={skill} />
}
