'use client'

import { SkillsSearch } from '@/components/skills/skills-search'
import { WorkspaceSkillsList } from '@/components/skills/workspace-skills-list'
import type { SkillListItem, SkillsSort } from '@/lib/skills/skill-list'
import { skillsHref } from '@/lib/skills/skills-href'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { ReactNode } from 'react'

type SkillsLibraryViewProps = {
  query: string
  sort: SkillsSort
  skills: SkillListItem[]
}

export function SkillsLibraryView({ query, sort, skills }: SkillsLibraryViewProps) {
  return (
    <section className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-6">
      <SkillsSearch initialQuery={query} resultCount={skills.length} variant="full" />

      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4">
        <SkillsLibraryTabs query={query} sort={sort} count={skills.length} />

        <div className="min-h-0 w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <WorkspaceSkillsList skills={skills} hasQuery={Boolean(query)} />
        </div>
      </div>
    </section>
  )
}

function SkillsLibraryTabs({
  query,
  sort,
  count,
}: {
  query: string
  sort: SkillsSort
  count: number
}) {
  const allActive = sort === 'usage'
  const recentActive = sort === 'recent'

  return (
    <nav aria-label="Skill library" className="flex items-center gap-1">
      <LibraryTab href={skillsHref({ query })} active={allActive} count={allActive ? count : undefined}>
        All
      </LibraryTab>
      <LibraryTab href={skillsHref({ sort: 'recent', query })} active={recentActive}>
        Recent
      </LibraryTab>
    </nav>
  )
}

function LibraryTab({
  href,
  active,
  count,
  children,
}: {
  href: string
  active: boolean
  count?: number
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-1 text-[13px] tracking-tight transition-colors duration-150',
        active
          ? 'bg-muted/60 font-medium text-foreground'
          : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground',
      )}
    >
      {children}
      {count !== undefined ? (
        <span className={cn('ml-1 tabular-nums', active ? 'text-muted-foreground' : 'text-muted-foreground/60')}>
          {count.toLocaleString('en-US')}
        </span>
      ) : null}
    </Link>
  )
}
