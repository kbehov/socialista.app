'use client'

import { FieldError, FieldLabel } from '@/components/forms/auth-form-shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { formatBytes, useFileUpload } from '@/hooks/use-file-upload'
import { cn } from '@/lib/utils'
import { createAiCompanySchema, type CreateAiCompanyFormValues } from '@/lib/zod/ai-company.schema'
import { createAiCompany, updateAiCompany, uploadAiCompanyLogo } from '@/services/ai-company.service'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AiCompany } from '@socialista/types'
import { ImageIcon, Loader2, UploadCloudIcon, XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

const emptyFormValues: CreateAiCompanyFormValues = {
  name: '',
}

const LOGO_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif'
const LOGO_MAX_SIZE = 2 * 1024 * 1024

type CreateAiCompanySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: AiCompany | null
}

export function CreateAiCompanySheet({ open, onOpenChange, company }: CreateAiCompanySheetProps) {
  const router = useRouter()
  const isEditing = Boolean(company)
  const [logoCleared, setLogoCleared] = useState(false)
  const [uploadState, { clearFiles, getInputProps, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog }] =
    useFileUpload({
      accept: LOGO_ACCEPT,
      maxFiles: 1,
      maxSize: LOGO_MAX_SIZE,
      multiple: false,
    })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateAiCompanyFormValues>({
    resolver: zodResolver(createAiCompanySchema),
    defaultValues: emptyFormValues,
    mode: 'onTouched',
  })

  const selected = uploadState.files[0]
  const selectedFile = selected?.file instanceof File ? selected.file : null
  const preview = selected?.preview ?? (logoCleared ? undefined : company?.logo)

  useEffect(() => {
    if (!open) {
      reset(emptyFormValues)
      clearFiles()
      setLogoCleared(false)
      return
    }

    reset({ name: company?.name ?? '' })
    clearFiles()
    setLogoCleared(false)
  }, [open, company, reset, clearFiles])

  const clearLogo = () => {
    clearFiles()
    setLogoCleared(true)
  }

  const onSubmit = handleSubmit(async values => {
    try {
      let logoUrl = !logoCleared ? (company?.logo ?? '') : ''

      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        const upload = await uploadAiCompanyLogo(formData)
        const url = upload.data?.url
        if (!upload.success || !url) {
          setError('root', { message: upload.message ?? 'Failed to upload logo' })
          return
        }
        logoUrl = url
      }

      if (!logoUrl) {
        setError('root', { message: 'Logo is required' })
        return
      }

      const payload = { name: values.name, logo: logoUrl }
      const result = isEditing ? await updateAiCompany(company!._id, payload) : await createAiCompany(payload)

      if (!result.success) {
        setError('root', {
          message: result.message ?? `Failed to ${isEditing ? 'update' : 'create'} company`,
        })
        return
      }

      toast.success(isEditing ? 'Company updated' : 'Company created')
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      setError('root', { message })
    }
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md p-2">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit company' : 'Create company'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the lab name and logo shown next to its models.'
              : 'Add an AI lab or company so models can display its logo.'}
          </SheetDescription>
        </SheetHeader>

        <form id="ai-company-form" onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 px-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="company-name">Name</FieldLabel>
            <Input
              id="company-name"
              placeholder="e.g. OpenAI"
              aria-invalid={Boolean(errors.name)}
              disabled={isSubmitting}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel>Logo</FieldLabel>
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
                  accept: LOGO_ACCEPT,
                  disabled: isSubmitting,
                })}
                className="sr-only"
              />

              {preview ? (
                <div className="flex items-center gap-3 p-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={openFileDialog}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left transition-opacity hover:opacity-80"
                  >
                    <img alt="Logo preview" className="size-12 object-contain" height={48} src={preview} width={48} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{selectedFile?.name ?? 'Current logo'}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedFile ? formatBytes(selectedFile.size) : 'Click to replace or drop a new file'}
                      </p>
                    </div>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Remove logo"
                    disabled={isSubmitting}
                    onClick={clearLogo}
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
                    {uploadState.isDragging ? 'Drop logo to upload' : 'Drop a logo or click to browse'}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    PNG, SVG, or WebP · up to {formatBytes(LOGO_MAX_SIZE)}
                  </span>
                </button>
              )}
            </div>
            {uploadState.errors[0] ? <FieldError message={uploadState.errors[0]} /> : null}
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
          <Button type="submit" form="ai-company-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                {isEditing ? 'Saving…' : 'Creating…'}
              </>
            ) : isEditing ? (
              'Save changes'
            ) : (
              'Create company'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
