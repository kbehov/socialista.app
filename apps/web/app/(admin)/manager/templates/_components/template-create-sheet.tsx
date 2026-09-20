'use client'

import { FieldError, FieldLabel } from '@/components/forms/auth-form-shared'
import { StudioTemplatePreviewMedia } from '@/components/studio/templates/studio-template-preview-media'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { formatBytes, useFileUpload } from '@/hooks/use-file-upload'
import { isVideoPreviewUrl } from '@/lib/studio/template-media'
import { cn } from '@/lib/utils'
import {
  createStudioTemplateSchema,
  type CreateStudioTemplateFormValues,
} from '@/lib/zod/studio-template.schema'
import { createStudioTemplate, uploadStudioTemplatePreview } from '@/services/studio-templates.service'
import { zodResolver } from '@hookform/resolvers/zod'
import type { StudioTemplateCategoryDto, StudioTemplateManagedKind } from '@socialista/types'
import { ImageIcon, Loader2, UploadCloudIcon, VideoIcon, XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/avif'
const VIDEO_ACCEPT = `video/mp4,video/webm,video/ogg,${IMAGE_ACCEPT}`
const IMAGE_MAX_SIZE = 10 * 1024 * 1024
const VIDEO_MAX_SIZE = 50 * 1024 * 1024

const emptyFormValues = (kind: StudioTemplateManagedKind): CreateStudioTemplateFormValues => ({
  kind,
  imageSource: 'upload',
  imageUrl: '',
  categories: [],
  prompt: '',
  name: '',
})

type TemplateCreateSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: StudioTemplateCategoryDto[]
  defaultKind?: StudioTemplateManagedKind
}

export function TemplateCreateSheet({
  open,
  onOpenChange,
  categories,
  defaultKind = 'image',
}: TemplateCreateSheetProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateStudioTemplateFormValues>({
    resolver: zodResolver(createStudioTemplateSchema),
    defaultValues: emptyFormValues(defaultKind),
    mode: 'onTouched',
  })

  const kind = useWatch({ control, name: 'kind' }) ?? defaultKind
  const imageSource = useWatch({ control, name: 'imageSource' }) ?? 'upload'
  const imageUrl = useWatch({ control, name: 'imageUrl' }) ?? ''
  const selectedCategories = useWatch({ control, name: 'categories' }) ?? []
  const isVideoKind = kind === 'video'
  const mediaAccept = isVideoKind ? VIDEO_ACCEPT : IMAGE_ACCEPT
  const mediaMaxSize = isVideoKind ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE

  const [uploadState, { clearFiles, getInputProps, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog }] =
    useFileUpload({
      accept: mediaAccept,
      maxFiles: 1,
      maxSize: mediaMaxSize,
      multiple: false,
    })

  const selected = uploadState.files[0]
  const selectedFile = selected?.file instanceof File ? selected.file : null
  const filePreview = selected?.preview
  const urlPreview = imageSource === 'url' && imageUrl.startsWith('http') ? imageUrl : undefined
  const preview = filePreview ?? urlPreview
  const selectedIsVideo = Boolean(selectedFile?.type.startsWith('video/') || (urlPreview && isVideoPreviewUrl(urlPreview)))

  useEffect(() => {
    reset(emptyFormValues(defaultKind))
    clearFiles()
  }, [open, defaultKind, reset, clearFiles])

  useEffect(() => {
    clearFiles()
  }, [kind, clearFiles])

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
          setError('root', {
            message: isVideoKind ? 'Upload a video or image, or switch to URL' : 'Upload an image or switch to Image URL',
          })
          return
        }
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('kind', values.kind)
        const upload = await uploadStudioTemplatePreview(formData)
        const url = upload.data?.url
        if (!upload.success || !url) {
          setError('root', { message: upload.message ?? 'Failed to upload media' })
          return
        }
        resolvedImageUrl = url
      }

      const result = await createStudioTemplate({
        kind: values.kind,
        categories: values.categories,
        prompt: values.prompt || undefined,
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
          <SheetDescription>
            Upload a preview, pick a category, and optionally add a prompt used to recreate it.
          </SheetDescription>
        </SheetHeader>

        <form id="create-studio-template-form" onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="template-kind">Kind</FieldLabel>
            <Controller
              name="kind"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger id="template-kind" className="w-full" aria-invalid={Boolean(errors.kind)}>
                    <SelectValue placeholder="Select kind" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.kind?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="template-image">{isVideoKind ? 'Preview media' : 'Preview image'}</FieldLabel>
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
                  {isVideoKind ? 'Media URL' : 'Image URL'}
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
                    accept: mediaAccept,
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
                      {selectedIsVideo ? (
                        <video src={preview} muted className="size-12 rounded-md object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="Preview" className="size-12 rounded-md object-cover" height={48} src={preview} width={48} />
                      )}
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
                      ) : isVideoKind ? (
                        <VideoIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
                      ) : (
                        <ImageIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="text-sm font-medium tracking-[-0.015em]">
                      {uploadState.isDragging
                        ? isVideoKind
                          ? 'Drop video to upload'
                          : 'Drop image to upload'
                        : isVideoKind
                          ? 'Drop a video or click to browse'
                          : 'Drop an image or click to browse'}
                    </span>
                    <span className="text-[12px] text-muted-foreground">
                      {isVideoKind
                        ? `MP4, WebM, or an image · up to ${formatBytes(mediaMaxSize)}`
                        : `PNG, JPEG, or WebP · up to ${formatBytes(mediaMaxSize)}`}
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  id="template-image"
                  placeholder={isVideoKind ? 'https://example.com/preview.mp4' : 'https://example.com/preview.jpg'}
                  aria-invalid={Boolean(errors.imageUrl)}
                  disabled={isSubmitting}
                  {...register('imageUrl')}
                />
                {urlPreview ? (
                  <div className="overflow-hidden rounded-xl border border-border">
                    <StudioTemplatePreviewMedia url={urlPreview} alt="URL preview" className="h-36 w-full" controls={selectedIsVideo} />
                  </div>
                ) : null}
                <FieldError message={errors.imageUrl?.message} />
              </div>
            )}
            {uploadState.errors[0] ? <FieldError message={uploadState.errors[0]} /> : null}
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="template-categories">Categories</FieldLabel>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Create a category first, then come back to add templates.</p>
            ) : (
              <div id="template-categories" className="flex flex-wrap gap-1.5">
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
                          : 'border-border bg-background text-foreground hover:bg-muted',
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
            <FieldLabel htmlFor="template-prompt">Prompt (optional)</FieldLabel>
            <Textarea
              id="template-prompt"
              placeholder="The prompt used to generate this template"
              aria-invalid={Boolean(errors.prompt)}
              disabled={isSubmitting}
              className="min-h-28"
              {...register('prompt')}
            />
            <FieldError message={errors.prompt?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="template-name">Name (optional)</FieldLabel>
            <Input
              id="template-name"
              placeholder="e.g. Product hero"
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
          <Button type="submit" form="create-studio-template-form" disabled={isSubmitting || categories.length === 0}>
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
