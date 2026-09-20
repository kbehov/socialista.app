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
  createStaticAdTemplateCategorySchema,
  type CreateStaticAdTemplateCategoryFormValues,
} from '@/lib/zod/static-ad-template.schema'
import { createStaticAdTemplateCategory } from '@/services/static-ad-templates.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type CreateStaticAdCategorySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const emptyFormValues: CreateStaticAdTemplateCategoryFormValues = {
  name: '',
}

export function CreateStaticAdCategorySheet({ open, onOpenChange }: CreateStaticAdCategorySheetProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateStaticAdTemplateCategoryFormValues>({
    resolver: zodResolver(createStaticAdTemplateCategorySchema),
    defaultValues: emptyFormValues,
    mode: 'onTouched',
  })

  useEffect(() => {
    reset(emptyFormValues)
  }, [open, reset])

  const onSubmit = handleSubmit(async values => {
    try {
      const result = await createStaticAdTemplateCategory({
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
            Categories group static ad templates in the studio gallery, like Product launch or Seasonal.
          </SheetDescription>
        </SheetHeader>

        <form id="create-static-ad-category-form" onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 px-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="static-ad-category-name">Name</FieldLabel>
            <Input
              id="static-ad-category-name"
              placeholder="e.g. Product launch"
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
          <Button type="submit" form="create-static-ad-category-form" disabled={isSubmitting}>
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
