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
  inspirationCategorySchema,
  type InspirationCategoryFormValues,
} from '@/lib/zod/inspiration.schema'
import { createInspirationCategory } from '@/services/inspiration.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type CreateCategorySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCategorySheet({ open, onOpenChange }: CreateCategorySheetProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InspirationCategoryFormValues>({
    resolver: zodResolver(inspirationCategorySchema),
    defaultValues: { name: '', icon: '' },
    mode: 'onTouched',
  })

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const onSubmit = handleSubmit(async values => {
    try {
      const result = await createInspirationCategory({
        name: values.name,
        icon: values.icon || undefined,
      })

      if (!result.success) {
        setError('root', { message: result.message ?? 'Failed to create category' })
        return
      }

      toast.success('Category created')
      onOpenChange(false)
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
            Categories help organize inspirations into broad themes like fitness, business, or lifestyle.
          </SheetDescription>
        </SheetHeader>

        <form id="create-category-form" onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 px-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="category-name">Name</FieldLabel>
            <Input
              id="category-name"
              placeholder="e.g. Mental health"
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="category-icon">Icon (optional)</FieldLabel>
            <Input
              id="category-icon"
              placeholder="Emoji or icon name"
              aria-invalid={Boolean(errors.icon)}
              {...register('icon')}
            />
            <FieldError message={errors.icon?.message} />
          </div>

          {errors.root?.message && (
            <div
              className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {errors.root.message}
            </div>
          )}
        </form>

        <SheetFooter className="flex-row justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-category-form" disabled={isSubmitting}>
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
