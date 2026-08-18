'use client'

import { FieldError } from '@/components/forms/auth-form-shared'
import { SkillMarkdownEditor } from '@/components/markdown-editor/skill-markdown-editor'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MANAGER_SKILL_ROUTES } from '@/constants/app-routes'
import { skillFormSchema, type SkillFormValues } from '@/lib/zod/skill.schema'
import { cn } from '@/lib/utils'
import { createSkill, updateSkill } from '@/services/skill.service'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Skill, SkillCategory, SkillVariable } from '@socialista/types'
import { ImageIcon, Loader2, PlusIcon, SmilePlus, Type, VideoIcon, XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { SKILL_BINDING_LABELS, SKILL_STATUS_LABELS } from './skill-utils'

const BINDING_OPTIONS = ['image', 'video', 'text'] as const
const STATUS_OPTIONS = ['draft', 'published', 'archived'] as const

const emptyValues: SkillFormValues = {
  name: '',
  description: '',
  categoryId: '',
  binding: 'image',
  status: 'draft',
  icon: '',
  content: '',
  variables: [],
}

function toFormValues(skill: Skill): SkillFormValues {
  return {
    name: skill.name,
    description: skill.description ?? '',
    categoryId: skill.categoryId,
    binding: skill.binding,
    status: skill.status,
    icon: skill.icon ?? '',
    content: skill.content,
    variables: (skill.variables ?? []).map(variable => ({
      key: variable.key,
      label: variable.label,
    })),
  }
}

function toSkillVariables(values: SkillFormValues['variables']): SkillVariable[] {
  return values.map(variable => ({
    key: variable.key,
    label: variable.label,
    type: 'text',
    required: false,
  }))
}

type SkillFormProps = {
  workspaceId: string
  categories: SkillCategory[]
  skill?: Skill
}

export function SkillForm({ workspaceId, categories, skill }: SkillFormProps) {
  const router = useRouter()
  const isEditing = Boolean(skill)
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: skill
      ? toFormValues(skill)
      : { ...emptyValues, categoryId: categories[0]?._id ?? '' },
    mode: 'onTouched',
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'variables' })
  const variables = useWatch({ control, name: 'variables' }) ?? []
  const icon = useWatch({ control, name: 'icon' }) ?? ''
  const editorVariables = variables.flatMap(variable =>
    variable.key.trim() ? [{ key: variable.key.trim(), label: variable.label || variable.key }] : [],
  )

  const cancelHref = skill ? MANAGER_SKILL_ROUTES.skill(skill._id) : MANAGER_SKILL_ROUTES.LIST

  const onSubmit = handleSubmit(async values => {
    try {
      const result = isEditing
        ? await updateSkill(skill!._id, {
            name: values.name,
            description: values.description,
            categoryId: values.categoryId,
            binding: values.binding,
            status: values.status,
            icon: values.icon || null,
            content: values.content,
            variables: toSkillVariables(values.variables),
          })
        : await createSkill({
            workspaceId,
            name: values.name,
            description: values.description,
            categoryId: values.categoryId,
            binding: values.binding,
            status: values.status,
            icon: values.icon || undefined,
            content: values.content,
            variables: toSkillVariables(values.variables),
          })

      if (!result.success || !result.data?.skill) {
        setError('root', {
          message: result.message ?? `Failed to ${isEditing ? 'update' : 'create'} skill`,
        })
        return
      }

      toast.success(isEditing ? 'Skill updated' : 'Skill created')
      router.push(MANAGER_SKILL_ROUTES.skill(result.data.skill._id))
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      setError('root', { message })
    }
  })

  return (
    <form onSubmit={onSubmit} autoComplete="off" className="mx-auto flex w-full max-w-7xl flex-col">
      <div className="flex items-start gap-3">
        <Controller
          name="icon"
          control={control}
          render={({ field }) => (
            <div className="relative mt-1">
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
                    'flex size-11 shrink-0 items-center justify-center rounded-xl text-[22px]',
                    'text-muted-foreground transition-[background-color,transform,color] duration-100 ease-out',
                    'hover:bg-muted hover:text-foreground active:scale-[0.97]',
                    icon && 'bg-muted/60',
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
          <label htmlFor="skill-name" className="sr-only">
            Name
          </label>
          <input
            id="skill-name"
            placeholder="Untitled skill"
            autoFocus={!isEditing}
            aria-invalid={Boolean(errors.name)}
            disabled={isSubmitting}
            className={cn(
              'w-full bg-transparent text-[28px] leading-[1.15] font-semibold tracking-[-0.035em] text-foreground outline-none sm:text-[32px]',
              'placeholder:text-muted-foreground/35',
              errors.name && 'caret-destructive',
            )}
            {...register('name')}
          />
          <FieldError message={errors.name?.message} />
          <label htmlFor="skill-description" className="sr-only">
            Description
          </label>
          <textarea
            id="skill-description"
            placeholder="Add a description…"
            rows={1}
            aria-invalid={Boolean(errors.description)}
            disabled={isSubmitting}
            className={cn(
              'mt-2 field-sizing-content min-h-6 w-full resize-none bg-transparent text-[15px] leading-6 text-muted-foreground outline-none',
              'placeholder:text-muted-foreground/45',
            )}
            {...register('description')}
          />
          <FieldError message={errors.description?.message} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-[7.5rem_minmax(0,1fr)] items-start gap-x-4 gap-y-2.5 pl-14">
        <p className="pt-1.5 text-[13px] text-muted-foreground">Category</p>
        <div>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                <SelectTrigger
                  id="skill-category"
                  size="sm"
                  className={propertyTriggerClass}
                  aria-invalid={Boolean(errors.categoryId)}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  {categories.map(category => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.icon ? `${category.icon} ${category.name}` : category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.categoryId?.message} />
        </div>

        <p className="pt-1.5 text-[13px] text-muted-foreground">Type</p>
        <div>
          <Controller
            name="binding"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                <SelectTrigger id="skill-binding" size="sm" className={propertyTriggerClass} aria-invalid={Boolean(errors.binding)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  {BINDING_OPTIONS.map(binding => (
                    <SelectItem key={binding} value={binding}>
                      <span className="flex items-center gap-2">
                        <BindingIcon binding={binding} />
                        {SKILL_BINDING_LABELS[binding]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.binding?.message} />
        </div>

        <p className="pt-1.5 text-[13px] text-muted-foreground">Status</p>
        <div>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                <SelectTrigger id="skill-status" size="sm" className={propertyTriggerClass} aria-invalid={Boolean(errors.status)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status} value={status}>
                      {SKILL_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.status?.message} />
        </div>

        <p className="pt-1.5 text-[13px] text-muted-foreground">Variables</p>
        <div className="min-w-0 space-y-2">
          {fields.length > 0 ? (
            <div className="space-y-1.5">
              {fields.map((field, index) => (
                <div key={field.id} className="group/var flex items-center gap-1.5">
                  <Input
                    placeholder="key"
                    aria-label={`Variable ${index + 1} key`}
                    aria-invalid={Boolean(errors.variables?.[index]?.key)}
                    className="h-8 border-transparent bg-muted/50 font-mono text-[13px] shadow-none focus-visible:border-input"
                    {...register(`variables.${index}.key`)}
                  />
                  <Input
                    placeholder="Label"
                    aria-label={`Variable ${index + 1} label`}
                    aria-invalid={Boolean(errors.variables?.[index]?.label)}
                    className="h-8 border-transparent bg-muted/50 text-[13px] shadow-none focus-visible:border-input"
                    {...register(`variables.${index}.label`)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove variable ${index + 1}`}
                    className="text-muted-foreground opacity-0 transition-opacity group-hover/var:opacity-100 hover:text-foreground"
                    onClick={() => remove(index)}
                    disabled={isSubmitting}
                  >
                    <XIcon />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => append({ key: '', label: '' })}
            className="inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <PlusIcon className="size-3.5" strokeWidth={1.75} />
            Add variable
          </button>
          {editorVariables.length > 0 ? (
            <p className="text-[12px] text-muted-foreground">Type / in the editor to insert a variable.</p>
          ) : null}
          <FieldError message={errors.variables?.message ?? errors.variables?.root?.message} />
        </div>
      </div>

      <div className="mt-8 border-t border-border/70 pt-6">
        <label htmlFor="skill-content" className="sr-only">
          Instructions
        </label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <SkillMarkdownEditor
              id="skill-content"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={isSubmitting}
              variables={editorVariables}
              aria-invalid={Boolean(errors.content)}
              aria-label="Skill instructions"
            />
          )}
        />
        <FieldError message={errors.content?.message} />
      </div>

      {errors.root?.message ? (
        <div
          className="mt-6 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {errors.root.message}
        </div>
      ) : null}

      <div className="sticky bottom-0 z-10 mt-10 flex items-center justify-end gap-2 border-t border-border/70 bg-background/80 py-3 backdrop-blur-xl">
        <Button type="button" variant="ghost" onClick={() => router.push(cancelHref)} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || categories.length === 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              {isEditing ? 'Saving…' : 'Creating…'}
            </>
          ) : isEditing ? (
            'Save'
          ) : (
            'Create'
          )}
        </Button>
      </div>
    </form>
  )
}

const propertyTriggerClass =
  'h-8 w-full max-w-[240px] justify-between border-transparent bg-transparent px-2 shadow-none hover:bg-muted data-placeholder:text-muted-foreground'

function BindingIcon({ binding }: { binding: (typeof BINDING_OPTIONS)[number] }) {
  if (binding === 'image') return <ImageIcon className="size-3.5" strokeWidth={1.75} />
  if (binding === 'video') return <VideoIcon className="size-3.5" strokeWidth={1.75} />
  return <Type className="size-3.5" strokeWidth={1.75} />
}
