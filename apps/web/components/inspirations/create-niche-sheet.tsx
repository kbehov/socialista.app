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
import { inspirationNicheSchema, type InspirationNicheFormValues } from '@/lib/zod/inspiration.schema'
import { createInspirationNiche } from '@/services/inspiration.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type CreateNicheSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateNicheSheet({ open, onOpenChange }: CreateNicheSheetProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InspirationNicheFormValues>({
    resolver: zodResolver(inspirationNicheSchema),
    defaultValues: { name: '', icon: '' },
    mode: 'onTouched',
  })

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const onSubmit = handleSubmit(async values => {
    try {
      const result = await createInspirationNiche({
        name: values.name,
        icon: values.icon || undefined,
      })

      if (!result.success) {
        setError('root', { message: result.message ?? 'Failed to create niche' })
        return
      }

      toast.success('Niche created')
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
          <SheetTitle>Create niche</SheetTitle>
          <SheetDescription>
            Niches describe specific audience segments or content angles within a category.
          </SheetDescription>
        </SheetHeader>

        <form id="create-niche-form" onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 px-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="niche-name">Name</FieldLabel>
            <Input
              id="niche-name"
              placeholder="e.g. Productivity tips"
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="niche-icon">Icon (optional)</FieldLabel>
            <Input
              id="niche-icon"
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
          <Button type="submit" form="create-niche-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Creating…
              </>
            ) : (
              'Create niche'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
