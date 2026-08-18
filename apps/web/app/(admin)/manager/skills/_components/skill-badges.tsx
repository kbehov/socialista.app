import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SkillBinding, SkillStatus } from '@socialista/types'
import { SKILL_BINDING_LABELS, SKILL_STATUS_LABELS } from './skill-utils'

const statusClassName: Record<SkillStatus, string> = {
  draft: 'border-transparent bg-muted text-muted-foreground',
  published: 'border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  archived: 'border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-400',
}

export function SkillBindingBadge({ binding }: { binding: SkillBinding }) {
  return (
    <Badge variant="outline" className="capitalize">
      {SKILL_BINDING_LABELS[binding]}
    </Badge>
  )
}

export function SkillStatusBadge({ status }: { status: SkillStatus }) {
  return <Badge className={cn('capitalize', statusClassName[status])}>{SKILL_STATUS_LABELS[status]}</Badge>
}

export function SkillSourceBadge({ source }: { source: 'system' | 'user' | 'forked' }) {
  if (source === 'system') {
    return (
      <Badge variant="secondary" className="capitalize">
        System
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="capitalize">
      {source === 'forked' ? 'Forked' : 'Workspace'}
    </Badge>
  )
}
