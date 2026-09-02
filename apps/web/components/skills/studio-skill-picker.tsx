'use client'

import { PromptInputButton } from '@/components/ai-elements/prompt-input'
import { StudioInputActionTooltip } from '@/components/studio/prompt/studio-input-action-tooltip'
import {
  STUDIO_TOOL_BUTTON_ACTIVE_CLASS,
  STUDIO_TOOL_BUTTON_CLASS,
} from '@/components/studio/prompt/studio-composer-surface'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { getWorkspaceSkills } from '@/services/skill.service'
import { useWorkspaceStore } from '@/store/workspace.store'
import { formatCount } from '@/utils/format'
import { PROMPT_KEY_LABELS, type PromptKey, type Skill } from '@socialista/types'
import { BrainIcon, CheckIcon, SearchIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

type StudioSkillPickerProps = {
  target: PromptKey
  value?: string
  onChange: (skillId?: string) => void
  onSelect?: (skill: Skill | undefined) => void
  disabled?: boolean
  className?: string
}

type StudioAttachedSkillProps = {
  skill: Pick<Skill, '_id' | 'name' | 'icon' | 'description'>
  onRemove: () => void
  disabled?: boolean
}

function SkillGlyph({
  icon,
  className,
}: {
  icon?: string
  className?: string
}) {
  if (icon) {
    return (
      <span className={cn('text-[13px] leading-none', className)} aria-hidden>
        {icon}
      </span>
    )
  }

  return <BrainIcon className={cn('size-3.5 text-muted-foreground', className)} strokeWidth={1.75} />
}

function SkillPickerRow({
  selected,
  icon,
  name,
  description,
  meta,
  onSelect,
}: {
  selected: boolean
  icon?: string
  name: string
  description?: string
  meta?: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors duration-150',
        'active:scale-[0.99] motion-reduce:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        selected ? 'bg-black/[0.04] dark:bg-white/[0.05]' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]',
      )}
    >
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-[13px] leading-none"
        aria-hidden
      >
        <SkillGlyph icon={icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium tracking-[-0.015em] text-foreground">
          {name}
        </span>
        {description ? (
          <span className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-black/48 dark:text-white/48">
            {description}
          </span>
        ) : meta ? (
          <span className="mt-0.5 block text-[11px] tabular-nums text-black/38 dark:text-white/38">
            {meta}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden
        className={cn(
          'flex size-4 shrink-0 items-center justify-center transition-opacity duration-150',
          selected ? 'opacity-100' : 'opacity-0',
        )}
      >
        <CheckIcon className="size-3.5 text-foreground" strokeWidth={2.25} />
      </span>
    </button>
  )
}

export function StudioAttachedSkill({
  skill,
  onRemove,
  disabled,
}: StudioAttachedSkillProps) {
  return (
    <div className="flex items-center gap-2 px-3 sm:px-3.5">
      <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden>
        <SkillGlyph icon={skill.icon} />
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-[12px] font-medium tracking-[-0.015em] text-foreground">
          {skill.name}
        </p>
        <p className="truncate text-[11px] text-black/44 dark:text-white/44">
          Overrides Socialista brain
        </p>
      </div>
      <button
        type="button"
        aria-label={`Remove ${skill.name}`}
        disabled={disabled}
        className="flex size-6 items-center justify-center rounded-md text-black/40 transition-colors hover:bg-black/[0.05] hover:text-foreground active:scale-[0.97] motion-reduce:active:scale-100 dark:text-white/40 dark:hover:bg-white/[0.08]"
        onClick={onRemove}
      >
        <XIcon className="size-3.5" strokeWidth={1.75} />
      </button>
    </div>
  )
}

export function StudioSkillPicker({
  target,
  value,
  onChange,
  onSelect,
  disabled,
  className,
}: StudioSkillPickerProps) {
  const workspaceId = useWorkspaceStore(s => s.currentWorkspace?._id)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill | undefined>()

  const targetLabel = PROMPT_KEY_LABELS[target]
  const selected = value
    ? selectedSkill?._id === value
      ? selectedSkill
      : (skills.find(skill => skill._id === value) ?? selectedSkill)
    : undefined

  const applySkill = useCallback(
    (skill: Skill | undefined) => {
      onChange(skill?._id)
      onSelect?.(skill)
      setSelectedSkill(skill)
      setOpen(false)
    },
    [onChange, onSelect],
  )

  const load = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    try {
      const result = await getWorkspaceSkills(workspaceId, {
        limit: 50,
        target,
        sort: '-updatedAt',
        query: query.trim() || undefined,
      })
      if (!result.success) {
        toast.error(result.message ?? 'Failed to load skills')
        return
      }
      setSkills(result.data?.skills ?? [])
    } catch {
      toast.error('Failed to load skills')
    } finally {
      setLoading(false)
    }
  }, [query, target, workspaceId])

  useEffect(() => {
    if (!open) return
    const timeout = window.setTimeout(() => {
      void load()
    }, query.trim() ? 200 : 0)
    return () => window.clearTimeout(timeout)
  }, [load, open, query])

  return (
    <>
      <StudioInputActionTooltip
        label={selected ? selected.name : 'Override Socialista brain'}
      >
        <PromptInputButton
          aria-label={selected ? `Skill: ${selected.name}` : 'Override Socialista brain'}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(
            STUDIO_TOOL_BUTTON_CLASS,
            'max-w-36 min-w-0 overflow-hidden',
            selected && STUDIO_TOOL_BUTTON_ACTIVE_CLASS,
            className,
          )}
          disabled={disabled}
          onClick={() => {
            setQuery('')
            setOpen(true)
          }}
          size="xs"
          type="button"
        >
          <BrainIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
          <span className="min-w-0 truncate text-[12px] font-medium leading-none tracking-[-0.015em]">
            {selected?.name ?? 'Skill'}
          </span>
        </PromptInputButton>
      </StudioInputActionTooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 overflow-hidden bg-background p-0 sm:max-w-md">
          <DialogHeader className="border-b border-black/[0.08] px-4 py-3 dark:border-white/[0.09]">
            <DialogTitle className="text-[13px] font-medium tracking-[-0.015em]">
              Override Socialista brain
            </DialogTitle>
            <DialogDescription className="text-[12px] leading-snug text-black/48 dark:text-white/48">
              Choose how Socialista thinks about {targetLabel.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>

          <div className="border-b border-black/[0.08] px-3 py-2 dark:border-white/[0.09]">
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-black/36 dark:text-white/36"
                strokeWidth={1.75}
              />
              <Input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search skills…"
                className="h-8 rounded-lg border-black/10 bg-transparent pl-8 text-[12px] shadow-none dark:border-white/10 dark:bg-transparent"
                autoFocus
              />
            </div>
          </div>

          <ScrollArea className="max-h-[min(50vh,20rem)]" scrollbarGutter>
            <div className="space-y-px p-1.5">
              {!workspaceId ? (
                <p className="px-2 py-8 text-center text-[12px] text-black/48 dark:text-white/48">
                  Select a workspace to attach a skill.
                </p>
              ) : loading ? (
                <>
                  <SkillRowSkeleton />
                  <SkillRowSkeleton />
                  <SkillRowSkeleton />
                </>
              ) : (
                <>
                  {!query.trim() ? (
                    <SkillPickerRow
                      selected={!value}
                      name="Socialista brain"
                      description="How we enhance your prompt"
                      onSelect={() => applySkill(undefined)}
                    />
                  ) : null}

                  {skills.map(skill => (
                    <SkillPickerRow
                      key={skill._id}
                      selected={value === skill._id}
                      icon={skill.icon}
                      name={skill.name}
                      description={skill.description}
                      meta={
                        skill.usageCount > 0
                          ? `${formatCount(skill.usageCount)} ${skill.usageCount === 1 ? 'use' : 'uses'}`
                          : undefined
                      }
                      onSelect={() => applySkill(skill)}
                    />
                  ))}

                  {skills.length === 0 ? (
                    query.trim() ? (
                      <p className="px-2 py-8 text-center text-[12px] text-black/48 dark:text-white/48">
                        No skills match your search.
                      </p>
                    ) : (
                      <div className="px-2 py-6 text-center">
                        <p className="text-[12px] font-medium tracking-[-0.01em] text-foreground">
                          No {targetLabel.toLowerCase()} skills yet
                        </p>
                        <p className="mt-1 text-[12px] leading-snug text-black/48 dark:text-white/48">
                          Create a skill to change how Socialista thinks.
                        </p>
                        <Button asChild size="sm" variant="outline" className="mt-3 h-7 rounded-md px-2.5 text-[12px]">
                          <Link href={DASHBOARD_ROUTES.createSkill}>Create skill</Link>
                        </Button>
                      </div>
                    )
                  ) : null}
                </>
              )}
            </div>
          </ScrollArea>

          {skills.length > 0 ? (
            <div className="border-t border-black/[0.08] px-4 py-2 dark:border-white/[0.09]">
              <Link
                href={DASHBOARD_ROUTES.createSkill}
                className="text-[12px] font-medium text-black/48 transition-colors hover:text-foreground dark:text-white/48"
              >
                Create skill
              </Link>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

function SkillRowSkeleton() {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5">
      <Skeleton className="size-7 rounded-md" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2.5 w-44" />
      </div>
    </div>
  )
}
