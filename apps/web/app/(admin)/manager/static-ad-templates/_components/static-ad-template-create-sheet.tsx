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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatBytes, useFileUpload } from '@/hooks/use-file-upload'
import { cn } from '@/lib/utils'
import {
  createStaticAdTemplateSchema,
  type CreateStaticAdTemplateFormValues,
} from '@/lib/zod/static-ad-template.schema'
import { createStaticAdTemplate, uploadStaticAdTemplatePreview } from '@/services/static-ad-templates.service'
import { zodResolver } from '@hookform/resolvers/zod'
import type { StaticAdTemplateCategoryDto } from '@socialista/types'
import { ImageIcon, Loader2, UploadCloudIcon, XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/avif'
const IMAGE_MAX_SIZE = 10 * 1024 * 1024

const emptyFormValues: CreateStaticAdTemplateFormValues = {
  imageSource: 'upload',
  imageUrl: '',
  categories: [],
  name: '',
}

type StaticAdTemplateCreateSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: StaticAdTemplateCategoryDto[]
}

export function StaticAdTemplateCreateSheet({
  open,
  onOpenChange,
  categories,
}: StaticAdTemplateCreateSheetProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateStaticAdTemplateFormValues>({
    resolver: zodResolver(createStaticAdTemplateSchema),
    defaultValues: emptyFormValues,
    mode: 'onTouched',
  })

  const imageSource = useWatch({ control, name: 'imageSource' }) ?? 'upload'
  const imageUrl = useWatch({ control, name: 'imageUrl' }) ?? ''
  const selectedCategories = useWatch({ control, name: 'categories' }) ?? []

  const [uploadState, { clearFiles, getInputProps, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog }] =
    useFileUpload({
      accept: IMAGE_ACCEPT,
      maxFiles: 1,
      maxSize: IMAGE_MAX_SIZE,
      multiple: false,
    })

  const selected = uploadState.files[0]
  const selectedFile = selected?.file instanceof File ? selected.file : null
  const filePreview = selected?.preview
  const urlPreview = imageSource === 'url' && imageUrl.startsWith('http') ? imageUrl : undefined
  const preview = filePreview ?? urlPreview

  useEffect(() => {
    reset(emptyFormValues)
    clearFiles()
  }, [open, reset, clearFiles])

  const toggleCategory = (name: string) => {
    const next = selectedCategories.includes(name)
      ? selectedCategories.filter(category => category !== name)
      : [...selectedCategories, name]
    setValue('categories', next, { shouldValidate: true })
  }

  const onSubmit = handleSubmit(async values => {
    try {
      let resolvedImageUrl = values.imageUrl

      if (values.imageSource === 'upload') {
        if (!selectedFile) {
          setError('root', { message: 'Upload an image or switch to Image URL' })
          return
        }
        const formData = new FormData()
        formData.append('file', selectedFile)
        const upload = await uploadStaticAdTemplatePreview(formData)
        const url = upload.data?.url
        if (!upload.success || !url) {
          setError('root', { message: upload.message ?? 'Failed to upload image' })
          return
        }
        resolvedImageUrl = url
      }

      const result = await createStaticAdTemplate({
        categories: values.categories,
        imageUrl: resolvedImageUrl,
        name: values.name || undefined,
      })

      if (!result.success) {
        setError('root', { message: result.message ?? 'Failed to create template' })
        return
      }

      toast.success('Template created')
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      setError('root', { message })
    }
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg p-2">
        <SheetHeader>
          <SheetTitle>Create template</SheetTitle>
          <SheetDescription>Upload a preview image and assign at least one category.</SheetDescription>
        </SheetHeader>

        <form id="create-static-ad-template-form" onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="static-ad-template-image">Preview image</FieldLabel>
            <Tabs
              value={imageSource}
              onValueChange={value => {
                if (value !== 'upload' && value !== 'url') return
                setValue('imageSource', value)
                if (value === 'upload') setValue('imageUrl', '')
                if (value === 'url') clearFiles()
              }}
            >
              <TabsList>
                <TabsTrigger value="upload" disabled={isSubmitting}>
                  Upload
                </TabsTrigger>
                <TabsTrigger value="url" disabled={isSubmitting}>
                  Image URL
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {imageSource === 'upload' ? (
              <div
                className={cn(
                  'relative overflow-hidden rounded-xl border border-dashed transition-colors duration-150',
                  uploadState.isDragging ? 'border-primary bg-primary/5' : 'border-border',
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  {...getInputProps({
                    accept: IMAGE_ACCEPT,
                    disabled: isSubmitting,
                  })}
                  className="sr-only"
                />

                {preview && selectedFile ? (
                  <div className="flex items-center gap-3 p-3">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={openFileDialog}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left transition-opacity hover:opacity-80"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="Preview" className="size-12 rounded-md object-cover" height={48} src={preview} width={48} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
                      </div>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Remove file"
                      disabled={isSubmitting}
                      onClick={() => clearFiles()}
                    >
                      <XIcon />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={openFileDialog}
                    className={cn(
                      'flex w-full flex-col items-center gap-2 px-4 py-6 text-center',
                      'transition-transform duration-150 ease-out active:scale-[0.98]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                      'motion-reduce:active:scale-100',
                    )}
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/40">
                      {uploadState.isDragging ? (
                        <UploadCloudIcon className="size-4 text-primary" strokeWidth={1.75} />
                      ) : (
                        <ImageIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="text-sm font-medium tracking-[-0.015em]">
                      {uploadState.isDragging ? 'Drop image to upload' : 'Drop an image or click to browse'}
                    </span>
                    <span className="text-[12px] text-muted-foreground">
                      PNG, JPEG, or WebP · up to {formatBytes(IMAGE_MAX_SIZE)}
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  id="static-ad-template-image"
                  placeholder="https://example.com/preview.jpg"
                  aria-invalid={Boolean(errors.imageUrl)}
                  disabled={isSubmitting}
                  {...register('imageUrl')}
                />
                {urlPreview ? (
                  <div className="overflow-hidden rounded-xl border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={urlPreview} alt="URL preview" className="h-36 w-full object-cover" />
                  </div>
                ) : null}
                <FieldError message={errors.imageUrl?.message} />
              </div>
            )}
            {uploadState.errors[0] ? <FieldError message={uploadState.errors[0]} /> : null}
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="static-ad-template-categories">Categories</FieldLabel>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Create a category first, then come back to add templates.</p>
            ) : (
              <div id="static-ad-template-categories" className="flex flex-wrap gap-1.5">
                {categories.map(category => {
                  const selectedCategory = selectedCategories.includes(category.name)
                  return (
                    <button
                      key={category._id}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => toggleCategory(category.name)}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                        selectedCategory
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-foreground hover:bg-muted/50',
                      )}
                    >
                      {category.name}
                    </button>
                  )
                })}
              </div>
            )}
            <FieldError message={errors.categories?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="static-ad-template-name">Name (optional)</FieldLabel>
            <Input
              id="static-ad-template-name"
              placeholder="Display name in the gallery"
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
          <Button type="submit" form="create-static-ad-template-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Creating…
              </>
            ) : (
              'Create template'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
