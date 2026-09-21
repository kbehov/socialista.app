'use client'

import { FieldError, FieldLabel } from '@/components/forms/auth-form-shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  updateStudioTemplateCategorySchema,
  type UpdateStudioTemplateCategoryFormValues,
} from '@/lib/zod/studio-template.schema'
import { updateStudioTemplateCategory } from '@/services/studio-templates.service'
import type { StudioTemplateCategoryDto } from '@socialista/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type EditTemplateCategorySheetProps = {
  category: StudioTemplateCategoryDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTemplateCategorySheet({ category, open, onOpenChange }: EditTemplateCategorySheetProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateStudioTemplateCategoryFormValues>({
    resolver: zodResolver(updateStudioTemplateCategorySchema),
    defaultValues: { name: '' },
    mode: 'onTouched',
  })

  useEffect(() => {
    if (!open) {
      reset({ name: '' })
      return
    }
    if (category) {
      reset({ name: category.name })
    }
  }, [open, category, reset])

  const onSubmit = handleSubmit(async values => {
    if (!category) return

    try {
      const result = await updateStudioTemplateCategory(category._id, {
        name: values.name,
      })

      if (!result.success) {
        setError('root', { message: result.message ?? 'Failed to update category' })
        return
      }

      toast.success('Category updated')
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
          <SheetTitle>Edit category</SheetTitle>
          <SheetDescription>
            Renaming updates image and video template filters and re-labels templates that use this category.
          </SheetDescription>
        </SheetHeader>

        <form id="edit-template-category-form" onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 px-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="edit-template-category-name">Name</FieldLabel>
            <Input
              id="edit-template-category-name"
              placeholder="e.g. Social media"
              aria-invalid={Boolean(errors.name)}
              disabled={isSubmitting || !category}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>

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
          <Button type="submit" form="edit-template-category-form" disabled={isSubmitting || !category}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
