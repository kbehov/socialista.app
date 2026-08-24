import { ErrorState } from '@/components/common/error-state'
import { SkillsLibraryView } from '@/components/skills/skills-library-view'
import { sortWorkspaceSkills, toSkillListItem, type SkillsSort } from '@/lib/skills/skill-list'
import { getWorkspaceSkills } from '@/services/skill.service'
import { firstSearchParam } from '@/utils/parsers'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { Suspense } from 'react'

type ContextSkillsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ContextSkillsPage({ searchParams }: ContextSkillsPageProps) {
  const params = await searchParams
  const workspace = await getCurrentWorkspace()
  const query = firstSearchParam(params.q)?.trim() ?? ''
  const sort: SkillsSort = firstSearchParam(params.sort) === 'recent' ? 'recent' : 'usage'
  const apiSort = sort === 'recent' ? '-updatedAt' : '-usageCount'

  if (!workspace) return null

  const result = await getWorkspaceSkills(workspace.id, {
    limit: 100,
    sort: apiSort,
    query: query || undefined,
  })

  if (!result.success) {
    return (
      <ErrorState
        title={result.message ?? 'Failed to load skills'}
        description="Refresh the page to try again."
        className="flex-1 rounded-xl"
      />
    )
  }

  const skills = sortWorkspaceSkills(result.data?.skills ?? [], sort).map(toSkillListItem)

  return (
    <Suspense fallback={null}>
      <SkillsLibraryView query={query} sort={sort} skills={skills} />
    </Suspense>
  )
}
