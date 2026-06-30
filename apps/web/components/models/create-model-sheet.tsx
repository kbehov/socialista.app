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
import { cn } from '@/lib/utils'
import { ModelTypePicker } from '@/components/models/model-type-picker'
import { COST_UNIT_OPTIONS, createModelSchema, type CreateModelFormValues } from '@/lib/zod/model.schema'
import { createModel, updateModel } from '@/services/models.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { CostUnit, ModelType, type Model } from '@socialista/types'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

const selectClassName = cn(
  'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30',
)

const emptyFormValues: CreateModelFormValues = {
  name: '',
  cost: '',
  costUnit: CostUnit.TOKENS,
  modelType: ModelType.TEXT,
  modelProvider: '',
}

function toFormValues(model: Model): CreateModelFormValues {
  return {
    name: model.name,
    cost: String(model.cost),
    costUnit: model.costUnit,
    modelType: model.modelType,
    modelProvider: model.modelProvider,
  }
}

type CreateModelSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  model?: Model | null
}

export function CreateModelSheet({ open, onOpenChange, model }: CreateModelSheetProps) {
  const router = useRouter()
  const isEditing = Boolean(model)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateModelFormValues>({
    resolver: zodResolver(createModelSchema),
    defaultValues: emptyFormValues,
    mode: 'onTouched',
  })

  useEffect(() => {
    if (!open) {
      reset(emptyFormValues)
      return
    }

    reset(model ? toFormValues(model) : emptyFormValues)
  }, [open, model, reset])

  const onSubmit = handleSubmit(async values => {
    const payload = {
      name: values.name,
      cost: Number(values.cost),
      costUnit: values.costUnit,
      modelType: values.modelType,
      modelProvider: values.modelProvider,
    }

    try {
      const result = isEditing
        ? await updateModel(model!._id, payload)
        : await createModel(payload)

      if (!result.success) {
        setError('root', {
          message: result.message ?? `Failed to ${isEditing ? 'update' : 'create'} model`,
        })
        return
      }

      toast.success(isEditing ? 'Model updated' : 'Model created')
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
          <SheetTitle>{isEditing ? 'Edit model' : 'Create model'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update pricing and metadata for this AI model.'
              : 'Add an AI model with pricing details for generation workflows.'}
          </SheetDescription>
        </SheetHeader>

        <form id="model-form" onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 px-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="model-name">Name</FieldLabel>
            <Input
              id="model-name"
              placeholder="e.g. GPT-4o"
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="model-provider">Provider</FieldLabel>
            <Input
              id="model-provider"
              placeholder="e.g. OpenAI"
              aria-invalid={Boolean(errors.modelProvider)}
              {...register('modelProvider')}
            />
            <FieldError message={errors.modelProvider?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="model-type">Type</FieldLabel>
            <Controller
              name="modelType"
              control={control}
              render={({ field }) => (
                <ModelTypePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.modelType)}
                />
              )}
            />
            <FieldError message={errors.modelType?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="model-cost-unit">Cost unit</FieldLabel>
            <select
              id="model-cost-unit"
              className={selectClassName}
              aria-invalid={Boolean(errors.costUnit)}
              {...register('costUnit')}
            >
              {COST_UNIT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.costUnit?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="model-cost">Cost</FieldLabel>
            <Input
              id="model-cost"
              type="number"
              min={0}
              step="any"
              placeholder="0.00"
              aria-invalid={Boolean(errors.cost)}
              {...register('cost')}
            />
            <FieldError message={errors.cost?.message} />
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
          <Button type="submit" form="model-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                {isEditing ? 'Saving…' : 'Creating…'}
              </>
            ) : isEditing ? (
              'Save changes'
            ) : (
              'Create model'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
