'use client'

import { PROMPT_KEY_VALUES, PROMPT_KEY_LABELS, type PromptKey } from '@socialista/types'
import { FieldError } from '@/components/forms/auth-form-shared'
import { SkillMarkdownEditor } from '@/components/markdown-editor/skill-markdown-editor'
import { WorkspaceSkillFormTopbar } from '@/components/skills/workspace-skill-form-topbar'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { consumeImportedSkillDraft } from '@/lib/skills/skill-import-storage'
import { cn } from '@/lib/utils'
import { skillFormSchema, type SkillFormValues } from '@/lib/zod/skill.schema'
import { createSkill, updateSkill } from '@/services/skill.service'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Skill } from '@socialista/types'
import { HelpCircleIcon, SmilePlus, XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, type ReactNode } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

const TARGET_HELP = 'Which generation tool this prompt replaces when you attach it.'
const INSTRUCTIONS_HELP =
  'Write as a brief for the model: what to do, what to avoid, and a short example of good output.'

const emptyValues: SkillFormValues = {
  name: '',
  description: '',
  target: 'image-prompt',
  icon: '',
  content: '',
}

const propertyTriggerClass =
  'h-8 w-full max-w-none justify-between border-transparent bg-transparent px-1.5 shadow-none hover:bg-muted/60 data-placeholder:text-muted-foreground/60'

function toFormValues(skill: Skill): SkillFormValues {
  return {
    name: skill.name,
    description: skill.description ?? '',
    target: skill.target,
    icon: skill.icon ?? '',
    content: skill.content,
  }
}

type WorkspaceSkillFormProps = {
  workspaceId: string
  skill?: Skill
}

export function WorkspaceSkillForm({ workspaceId, skill }: WorkspaceSkillFormProps) {
  const router = useRouter()
  const isEditing = Boolean(skill)
  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: skill ? toFormValues(skill) : emptyValues,
    mode: 'onTouched',
  })
  const icon = useWatch({ control, name: 'icon' }) ?? ''
  const name = useWatch({ control, name: 'name' }) ?? ''
  const displayName = name.trim() || 'Untitled skill'

  useEffect(() => {
    if (skill) return
    const draft = consumeImportedSkillDraft()
    if (!draft) return
    setValue('name', draft.name)
    setValue('description', draft.description)
    setValue('target', draft.target)
    setValue('icon', draft.icon)
    setValue('content', draft.content)
  }, [skill, setValue])

  const onSubmit = handleSubmit(async values => {
    try {
      const result = isEditing
        ? await updateSkill(skill!._id, {
            name: values.name,
            description: values.description,
            target: values.target,
            icon: values.icon || null,
            content: values.content,
          })
        : await createSkill({
            workspaceId,
            name: values.name,
            description: values.description,
            target: values.target,
            icon: values.icon || undefined,
            content: values.content,
          })

      if (!result.success || !result.data?.skill) {
        setError('root', {
          message: result.message ?? `Failed to ${isEditing ? 'update' : 'create'} skill`,
        })
        return
      }

      toast.success(isEditing ? 'Skill updated' : 'Skill created')
      router.push(DASHBOARD_ROUTES.SKILLS)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      setError('root', { message })
    }
  })

  const submitRef = useRef(onSubmit)

  useEffect(() => {
    submitRef.current = onSubmit
  }, [onSubmit])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        void submitRef.current()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <form onSubmit={onSubmit} autoComplete="off" className="flex flex-col">
      <WorkspaceSkillFormTopbar
        displayName={displayName}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
      />

      <div className="mx-auto w-full max-w-[720px] px-1 pb-24 pt-10 sm:pt-12">
        <div className="flex items-start gap-3">
          <Controller
            name="icon"
            control={control}
            render={({ field }) => (
              <div className="relative mt-1 shrink-0">
                <EmojiPicker
                  onEmojiSelect={emoji => field.onChange(emoji)}
                  side="bottom"
                  align="start"
                  disabled={isSubmitting}
                >
                  <button
                    type="button"
                    aria-label={icon ? 'Change icon' : 'Add icon'}
                    className={cn(
                      'flex size-12 items-center justify-center rounded-xl text-[26px]',
                      'text-muted-foreground transition-[background-color,transform,color] duration-100 ease-out',
                      'hover:bg-muted/80 hover:text-foreground active:scale-[0.97]',
                      icon && 'bg-muted/50',
                    )}
                  >
                    {icon || <SmilePlus className="size-5" strokeWidth={1.5} />}
                  </button>
                </EmojiPicker>
                {icon ? (
                  <button
                    type="button"
                    aria-label="Remove icon"
                    disabled={isSubmitting}
                    className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-xs transition-colors hover:bg-foreground hover:text-background"
                    onClick={() => field.onChange('')}
                  >
                    <XIcon className="size-2.5" />
                  </button>
                ) : null}
              </div>
            )}
          />
          <div className="min-w-0 flex-1">
            <label htmlFor="workspace-skill-name" className="sr-only">
              Name
            </label>
            <input
              id="workspace-skill-name"
              placeholder="Untitled skill"
              autoFocus={!isEditing}
              aria-invalid={Boolean(errors.name)}
              disabled={isSubmitting}
              className={cn(
                'w-full bg-transparent text-[32px] leading-[1.12] font-bold tracking-[-0.04em] text-foreground outline-none sm:text-[40px]',
                'placeholder:text-muted-foreground/30',
                errors.name && 'caret-destructive',
              )}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
            <label htmlFor="workspace-skill-description" className="sr-only">
              Description
            </label>
            <textarea
              id="workspace-skill-description"
              placeholder="What is this skill for?"
              rows={1}
              aria-invalid={Boolean(errors.description)}
              disabled={isSubmitting}
              className={cn(
                'mt-3 field-sizing-content min-h-7 w-full resize-none bg-transparent text-[15px] leading-relaxed text-muted-foreground outline-none',
                'placeholder:text-muted-foreground/40',
              )}
              {...register('description')}
            />
            <FieldError message={errors.description?.message} />
          </div>
        </div>

        <div className="mt-8 space-y-0.5">
          <p className="mb-2 px-2 text-[11px] font-medium tracking-[0.06em] text-muted-foreground/70 uppercase">
            Properties
          </p>

          <PropertyRow label="Overrides" tooltip={TARGET_HELP}>
            <Controller
              name="target"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger
                    id="workspace-skill-target"
                    size="sm"
                    className={propertyTriggerClass}
                    aria-invalid={Boolean(errors.target)}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    {PROMPT_KEY_VALUES.map(target => (
                      <SelectItem key={target} value={target}>
                        {PROMPT_KEY_LABELS[target as PromptKey]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="px-1.5 pt-1 text-[12px] leading-relaxed text-muted-foreground/70">
              Attach this skill to replace the default system prompt for that tool.
            </p>
            <FieldError message={errors.target?.message} />
          </PropertyRow>
        </div>

        <div className="mt-10">
          <div className="mb-3 flex items-center gap-1.5 px-2">
            <p className="text-[11px] font-medium tracking-[0.06em] text-muted-foreground/70 uppercase">
              Instructions
            </p>
            <FieldHelp label="Instructions" text={INSTRUCTIONS_HELP} />
          </div>
          <p className="mb-3 px-2 text-[13px] leading-relaxed text-muted-foreground">
            Tell the AI how to generate. Include the goal, constraints, and a short example of a good result.
          </p>
          <label htmlFor="workspace-skill-content" className="sr-only">
            Instructions
          </label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <SkillMarkdownEditor
                id="workspace-skill-content"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.content)}
                aria-label="Skill instructions"
                placeholder="You are generating… Always… Never… Example:"
                className="[&_.tiptap]:min-h-[220px]"
              />
            )}
          />
          <FieldError message={errors.content?.message} />
        </div>

        {errors.root?.message ? (
          <div
            className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
            role="alert"
          >
            {errors.root.message}
          </div>
        ) : null}

        <p className="mt-8 text-center text-[12px] text-muted-foreground/50">
          <kbd className="rounded border border-border/60 bg-muted/40 px-1 py-px font-mono text-[11px]">⌘</kbd>
          {' + '}
          <kbd className="rounded border border-border/60 bg-muted/40 px-1 py-px font-mono text-[11px]">Enter</kbd>
          {' to save'}
        </p>
      </div>
    </form>
  )
}

function PropertyRow({
  label,
  tooltip,
  children,
}: {
  label: string
  tooltip?: string
  children: ReactNode
}) {
  return (
    <div className="group grid grid-cols-[7.5rem_minmax(0,1fr)] items-start gap-x-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/40">
      <div className="flex items-center gap-1 pt-1.5">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        {tooltip ? <FieldHelp label={label} text={tooltip} /> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function FieldHelp({ label, text }: { label: string; text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:text-foreground"
          aria-label={`${label} help`}
        >
          <HelpCircleIcon className="size-3.5" strokeWidth={1.75} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-left leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  )
}
