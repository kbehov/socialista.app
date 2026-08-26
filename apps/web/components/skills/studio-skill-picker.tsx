'use client'

import { PromptInputButton } from '@/components/ai-elements/prompt-input'
import { StudioInputActionTooltip } from '@/components/studio/prompt/studio-input-action-tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { getWorkspaceSkills } from '@/services/skill.service'
import { useWorkspaceStore } from '@/store/workspace.store'
import type { PromptKey, Skill } from '@socialista/types'
import { SparklesIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

const NONE = 'none'

type StudioSkillPickerProps = {
  target: PromptKey
  value?: string
  onChange: (skillId?: string) => void
  disabled?: boolean
  className?: string
}

export function StudioSkillPicker({
  target,
  value,
  onChange,
  disabled,
  className,
}: StudioSkillPickerProps) {
  const workspaceId = useWorkspaceStore(s => s.currentWorkspace?._id)
  const [skills, setSkills] = useState<Skill[]>([])

  useEffect(() => {
    if (!workspaceId) return

    let cancelled = false
    void getWorkspaceSkills(workspaceId, { limit: 50, target, sort: '-updatedAt' }).then(result => {
      if (cancelled) return
      setSkills(result.data?.skills ?? [])
    })

    return () => {
      cancelled = true
    }
  }, [workspaceId, target])

  if (!workspaceId || skills.length === 0) return null

  const selected = skills.find(skill => skill._id === value)

  const skillTooltip = selected
    ? `Skill: ${selected.name}`
    : 'Workspace skill — custom system prompt'

  return (
    <DropdownMenu>
      <StudioInputActionTooltip label={skillTooltip}>
        <DropdownMenuTrigger asChild>
          <PromptInputButton
            aria-label={selected ? `Skill ${selected.name}` : 'Default system prompt'}
          className={cn(
            'h-7 max-w-40 gap-1.5 rounded-xl border px-1.5 pr-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
            'border-border/40 bg-background/90 transition-[border-color,background-color,box-shadow] duration-150',
            'hover:border-border/65 hover:bg-background',
            'active:scale-[0.97]',
            className,
          )}
          disabled={disabled}
          type="button"
        >
          <SparklesIcon className="size-3.5 shrink-0 text-muted-foreground/70" />
          <span className="truncate text-xs font-medium leading-none tracking-[-0.015em]">
            {selected?.name ?? 'Default'}
          </span>
        </PromptInputButton>
        </DropdownMenuTrigger>
      </StudioInputActionTooltip>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuRadioGroup
          value={value ?? NONE}
          onValueChange={next => onChange(next === NONE ? undefined : next)}
        >
          <DropdownMenuRadioItem className="rounded-lg" value={NONE}>
            Default
          </DropdownMenuRadioItem>
          {skills.map(skill => (
            <DropdownMenuRadioItem key={skill._id} className="rounded-lg" value={skill._id}>
              {skill.icon ? <span className="mr-1">{skill.icon}</span> : null}
              {skill.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
