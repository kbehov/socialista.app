import { getSkill } from '@/services/skill.service'
import { notFound } from 'next/navigation'
import { SkillView } from '../_components/skill-view'

export default async function SkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getSkill(id)
  const skill = result.data?.skill

  if (!skill) {
    notFound()
  }

  return <SkillView skill={skill} />
}
