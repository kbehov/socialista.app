'use client'

import { FieldError, FieldLabel } from '@/components/forms/auth-form-shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { skillCategoryFormSchema, type SkillCategoryFormValues } from '@/lib/zod/skill.schema'
import { createSkillCategory, updateSkillCategory } from '@/services/skill-category.service'
import { zodResolver } from '@hookform/resolvers/zod'
import type { SkillCategory } from '@socialista/types'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

const emptyValues: SkillCategoryFormValues = {
  name: '',
  description: '',
  icon: '',
  sortOrder: 0,
  status: 'active',
}

function toFormValues(category: SkillCategory): SkillCategoryFormValues {
  return {
    name: category.name,
    description: category.description ?? '',
    icon: category.icon ?? '',
    sortOrder: category.sortOrder ?? 0,
    status: category.status,
  }
}

type SkillCategorySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  category?: SkillCategory | null
}

export function SkillCategorySheet({ open, onOpenChange, workspaceId, category }: SkillCategorySheetProps) {
  const router = useRouter()
  const isEditing = Boolean(category)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SkillCategoryFormValues>({
    resolver: zodResolver(skillCategoryFormSchema),
    defaultValues: emptyValues,
    mode: 'onTouched',
  })

  useEffect(() => {
    if (!open) {
      reset(emptyValues)
      return
    }

    reset(category ? toFormValues(category) : emptyValues)
  }, [open, category, reset])

  const onSubmit = handleSubmit(async values => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      icon: values.icon || undefined,
      sortOrder: values.sortOrder,
    }

    try {
      const result = isEditing
        ? await updateSkillCategory(category!._id, { ...payload, status: values.status })
        : await createSkillCategory({ ...payload, workspaceId })

      if (!result.success) {
        setError('root', {
          message: result.message ?? `Failed to ${isEditing ? 'update' : 'create'} category`,
        })
        return
      }

      toast.success(isEditing ? 'Category updated' : 'Category created')
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      setError('root', { message })
    }
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit category' : 'Create category'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update how this category appears in the skill catalog.'
              : 'Group related skills so they are easier to find and assign.'}
          </SheetDescription>
        </SheetHeader>

        <form id="skill-category-form" onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 px-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="category-name">Name</FieldLabel>
            <Input
              id="category-name"
              placeholder="e.g. Product & ecommerce"
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="category-icon">Icon</FieldLabel>
            <Input
              id="category-icon"
              placeholder="Optional emoji"
              aria-invalid={Boolean(errors.icon)}
              {...register('icon')}
            />
            <FieldError message={errors.icon?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="category-description">Description</FieldLabel>
            <Textarea
              id="category-description"
              placeholder="What kinds of skills belong here?"
              rows={3}
              aria-invalid={Boolean(errors.description)}
              {...register('description')}
            />
            <FieldError message={errors.description?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="category-sort-order">Sort order</FieldLabel>
            <Input
              id="category-sort-order"
              type="number"
              min={0}
              step={1}
              aria-invalid={Boolean(errors.sortOrder)}
              {...register('sortOrder', { valueAsNumber: true })}
            />
            <FieldError message={errors.sortOrder?.message} />
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <FieldLabel htmlFor="category-status">Status</FieldLabel>
              <select
                id="category-status"
                className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                aria-invalid={Boolean(errors.status)}
                {...register('status')}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
              <FieldError message={errors.status?.message} />
            </div>
          ) : null}

          {errors.root?.message ? (
            <div
              className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {errors.root.message}
            </div>
          ) : null}
        </form>

        <SheetFooter className="flex-row justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="skill-category-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                {isEditing ? 'Saving…' : 'Creating…'}
              </>
            ) : isEditing ? (
              'Save changes'
            ) : (
              'Create category'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
