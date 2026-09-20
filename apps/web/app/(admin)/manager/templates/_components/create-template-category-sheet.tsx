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
  createStudioTemplateCategorySchema,
  type CreateStudioTemplateCategoryFormValues,
} from '@/lib/zod/studio-template.schema'
import { createStudioTemplateCategory } from '@/services/studio-templates.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type CreateTemplateCategorySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const emptyFormValues: CreateStudioTemplateCategoryFormValues = {
  name: '',
}

export function CreateTemplateCategorySheet({ open, onOpenChange }: CreateTemplateCategorySheetProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateStudioTemplateCategoryFormValues>({
    resolver: zodResolver(createStudioTemplateCategorySchema),
    defaultValues: emptyFormValues,
    mode: 'onTouched',
  })

  useEffect(() => {
    reset(emptyFormValues)
  }, [open, reset])

  const onSubmit = handleSubmit(async values => {
    try {
      const result = await createStudioTemplateCategory({
        name: values.name,
      })

      if (!result.success) {
        setError('root', { message: result.message ?? 'Failed to create category' })
        return
      }

      toast.success('Category created')
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
          <SheetTitle>Create category</SheetTitle>
          <SheetDescription>
            Categories are shared by image and video templates so you can filter both galleries with the same
            name, like Social media.
          </SheetDescription>
        </SheetHeader>

        <form id="create-template-category-form" onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 px-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="template-category-name">Name</FieldLabel>
            <Input
              id="template-category-name"
              placeholder="e.g. Social media"
              aria-invalid={Boolean(errors.name)}
              disabled={isSubmitting}
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
          <Button type="submit" form="create-template-category-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Creating…
              </>
            ) : (
              'Create category'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
