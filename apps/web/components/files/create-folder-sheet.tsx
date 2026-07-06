'use client'

import { createFolder } from '@/services/files.service'
import { useWorkspaceStore } from '@/store/workspace.store'
import { zodResolver } from '@hookform/resolvers/zod'
import { FolderPlusIcon, Loader2, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { Switch } from '../ui/switch'

const createFolderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  isPublic: z.boolean(),
  workspaceId: z.string().optional(),
})

type CreateFolderSheetProps = {
  variant?: 'default' | 'toolbar'
}

export const CreateFolderSheet = ({ variant = 'default' }: CreateFolderSheetProps) => {
  const router = useRouter()
  const { currentWorkspace } = useWorkspaceStore()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof createFolderSchema>>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      name: '',
      isPublic: false,
      workspaceId: currentWorkspace?.id ?? undefined,
    },
  })

  const onSubmit = handleSubmit(async data => {
    const response = await createFolder(data)
    if (response.success) {
      toast.success('Folder created successfully')
      reset()
      router.refresh()
    } else {
      toast.error(response.message ?? 'Failed to create folder')
    }
  })

  return (
    <Sheet>
      <SheetTrigger asChild>
        {variant === 'toolbar' ? (
          <Button type="button" size="xs" variant="outline">
            <FolderPlusIcon />
            New folder
          </Button>
        ) : (
          <Button size="sm">
            <PlusIcon className="w-4 h-4" />
            New folder
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New folder</SheetTitle>
          <SheetClose />
        </SheetHeader>
        <form onSubmit={onSubmit} className="space-y-4 p-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input {...register('name')} />
            </Field>
            <FieldError errors={[errors.name ? { message: errors.name.message } : undefined]} />
            <Field>
              <FieldLabel>Public</FieldLabel>
              <FieldDescription>Allow others in your workspace to access this folder.</FieldDescription>
              <Switch {...register('isPublic')} />
            </Field>
          </FieldGroup>
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Creating…
              </>
            ) : (
              'Create folder'
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
