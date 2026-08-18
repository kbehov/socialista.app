import { PageHeader } from '@/components/headers/page-header'
import { SmartPagination } from '@/components/common/smart-pagination'
import { Button } from '@/components/ui/button'
import { MANAGER_SKILL_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { getWorkspaceSkillCategories } from '@/services/skill-category.service'
import { getWorkspaceSkills } from '@/services/skill.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import type { MetaResponse } from '@socialista/types'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { SkillsList } from './_components/skills-list'

type SkillsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const defaultMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: 20,
  hasNextPage: false,
  hasPreviousPage: false,
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function SkillsPage({ searchParams }: SkillsPageProps) {
  const params = await searchParams
  const workspace = await getCurrentWorkspace()
  const categoryId = firstParam(params.categoryId)
  const page = firstParam(params.page) ?? '1'

  if (!workspace) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Skills"
          description="Create reusable generation instructions."
          breadcrumbs={[{ label: 'Manager', href: '/manager' }, { label: 'Skills' }]}
        />
        <p className="text-sm text-muted-foreground">Select a workspace to manage skills.</p>
      </div>
    )
  }

  const [categoriesResult, skillsResult] = await Promise.all([
    getWorkspaceSkillCategories(workspace.id, { limit: 100, status: 'active' }),
    getWorkspaceSkills(workspace.id, {
      page: Number(page) || 1,
      limit: 20,
      sort: '-updatedAt',
      categoryId,
    }),
  ])

  const categories = categoriesResult.data?.categories ?? []
  const skills = skillsResult.data?.skills ?? []
  const meta = skillsResult.meta ?? defaultMeta

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Skills"
        description="Reusable markdown instructions for image, video, and text generation."
        breadcrumbs={[{ label: 'Manager', href: '/manager' }, { label: 'Skills' }]}
        actions={
          <Button asChild size="sm" className="h-8 gap-1.5 rounded-lg">
            <Link href={MANAGER_SKILL_ROUTES.CREATE}>
              <PlusIcon className="size-3.5" />
              New skill
            </Link>
          </Button>
        }
      />

      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant={!categoryId ? 'default' : 'outline'} className="h-8 rounded-full">
            <Link href={MANAGER_SKILL_ROUTES.LIST}>All</Link>
          </Button>
          {categories.map(category => (
            <Button
              key={category._id}
              asChild
              size="sm"
              variant={categoryId === category._id ? 'default' : 'outline'}
              className="h-8 rounded-full"
            >
              <Link
                href={`${MANAGER_SKILL_ROUTES.LIST}?categoryId=${category._id}`}
                className={cn(categoryId === category._id && 'shadow-none')}
              >
                {category.icon ? <span>{category.icon}</span> : null}
                {category.name}
              </Link>
            </Button>
          ))}
        </div>
      ) : null}

      <SkillsList skills={skills} hasFilters={Boolean(categoryId)} />
      {skills.length > 0 ? <SmartPagination meta={meta} /> : null}
    </div>
  )
}
