'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { uploadToWorkspace } from '@/services/files.service'
import { createBrand, updateBrand } from '@/services/brand.service'
import { getProjectId, useProjectStore } from '@/store/project.store'
import { useWorkspaceStore } from '@/store/workspace.store'
import { getInitials } from '@/utils/user'
import type { Brand } from '@socialista/types'
import { CameraIcon, Loader2Icon, PlusIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react'
import { toast } from 'sonner'

const MAX_BRAND_COLORS = 12
const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

type BrandDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  brand?: Brand | null
  onSaved?: () => void
}

function normalizeHexColor(value: string): string | undefined {
  const trimmed = value.trim().toLowerCase()
  if (!HEX_COLOR_RE.test(trimmed)) return undefined
  if (trimmed.length === 4) {
    const r = trimmed[1]
    const g = trimmed[2]
    const b = trimmed[3]
    if (!r || !g || !b) return undefined
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return trimmed
}

function normalizeWebsite(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(withProtocol)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
    return withProtocol
  } catch {
    return undefined
  }
}

export function BrandDialog({ open, onOpenChange, workspaceId, brand, onSaved }: BrandDialogProps) {
  const isEdit = Boolean(brand)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 gap-1 border-b border-foreground/10 px-6 py-5 pr-12 text-left">
          <DialogTitle className="text-base font-medium tracking-[-0.02em]">
            {isEdit ? 'Edit brand' : 'New brand'}
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground/56">
            {isEdit
              ? 'Update the identity used as context for posts, skills, and studio tools.'
              : 'Name, logo, colors, and positioning used as context for AI tools.'}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <BrandForm
            key={brand?._id ?? 'create'}
            workspaceId={workspaceId}
            brand={brand}
            onClose={() => onOpenChange(false)}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function BrandForm({
  workspaceId,
  brand,
  onClose,
  onSaved,
}: {
  workspaceId: string
  brand?: Brand | null
  onClose: () => void
  onSaved?: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const projectId = useProjectStore(s => getProjectId(s.currentProject))
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const isEdit = Boolean(brand)

  const [name, setName] = useState(brand?.name ?? '')
  const [description, setDescription] = useState(brand?.description ?? '')
  const [industry, setIndustry] = useState(brand?.industry ?? '')
  const [website, setWebsite] = useState(brand?.website ?? '')
  const [logoUrl] = useState(brand?.logo ?? '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [colors, setColors] = useState<string[]>(brand?.colors ?? [])
  const [draftColor, setDraftColor] = useState('#0a84ff')
  const [isPending, startTransition] = useTransition()

  const trimmedName = name.trim()
  const displayedLogo = logoPreview ?? (removeLogo ? '' : logoUrl)

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview)
    }
  }, [logoPreview])

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file')
      return
    }

    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoPreview(URL.createObjectURL(file))
    setLogoFile(file)
    setRemoveLogo(false)
  }

  const clearLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoFile(null)
    setLogoPreview(null)
    if (isEdit && logoUrl) {
      setRemoveLogo(true)
    }
  }

  const addColor = () => {
    const hex = normalizeHexColor(draftColor)
    if (!hex) {
      toast.error('Enter a valid hex color')
      return
    }
    if (colors.includes(hex)) return
    if (colors.length >= MAX_BRAND_COLORS) {
      toast.error(`A brand can have at most ${MAX_BRAND_COLORS} colors`)
      return
    }
    setColors(current => [...current, hex])
  }

  const uploadLogo = async (): Promise<string | undefined> => {
    if (!logoFile) return undefined
    if ((currentWorkspace?.limits.storage ?? 0) <= 0) {
      toast.error('This workspace has no storage available')
      return undefined
    }

    const formData = new FormData()
    formData.append('file', logoFile)
    const upload = await uploadToWorkspace(workspaceId, formData)
    const url = upload.data?.url
    if (!upload.success || !url) {
      toast.error(upload.message ?? 'Couldn’t upload logo')
      return undefined
    }
    return url
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!trimmedName || isPending) return

    const websiteValue = website.trim()
    const normalizedWebsite = websiteValue ? normalizeWebsite(websiteValue) : undefined
    if (websiteValue && !normalizedWebsite) {
      toast.error('Enter a valid website URL')
      return
    }

    startTransition(async () => {
      try {
        const nextLogo = await uploadLogo()
        if (logoFile && !nextLogo) return

        if (isEdit && brand) {
          const response = await updateBrand(brand._id, {
            name: trimmedName,
            description: description.trim(),
            industry: industry.trim(),
            website: normalizedWebsite ?? '',
            logo: nextLogo ?? (removeLogo ? '' : undefined),
            colors,
          })

          if (!response.success || !response.data?.brand) {
            toast.error(response.message ?? 'Failed to update brand')
            return
          }

          toast.success('Brand updated')
          onClose()
          onSaved?.()
          return
        }

        const response = await createBrand({
          workspaceId,
          projectId,
          name: trimmedName,
          description: description.trim() || undefined,
          industry: industry.trim() || undefined,
          website: normalizedWebsite,
          logo: nextLogo,
          colors,
        })

        if (!response.success || !response.data?.brand) {
          toast.error(response.message ?? 'Failed to create brand')
          return
        }

        toast.success(`Added “${trimmedName}”`)
        onClose()
        onSaved?.()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Couldn’t save brand')
      }
    })
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className={cn(
              'relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-foreground/[0.04]',
              'transition-transform duration-150 ease-out active:scale-[0.98]',
              'hover:bg-foreground/[0.06] focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none',
              'motion-reduce:active:scale-100',
            )}
            aria-label="Choose brand logo"
          >
            {displayedLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayedLogo} alt="" className="size-full object-cover" />
            ) : (
              <span className="text-base font-medium tracking-[-0.01em] text-foreground/56">
                {getInitials(trimmedName || 'Brand')}
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-foreground/44 opacity-0 transition-opacity hover:opacity-100">
              <CameraIcon className="size-4 text-background" strokeWidth={1.75} />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={event => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) handleLogoFile(file)
            }}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium tracking-[-0.01em]">Logo</p>
            <p className="mt-0.5 text-sm text-foreground/56">Optional. A square image works best.</p>
            {displayedLogo || logoFile ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 h-7 px-0 text-sm text-foreground/56 hover:text-foreground"
                onClick={clearLogo}
                disabled={isPending}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand-name" className="text-xs font-medium text-foreground/56">
            Name
          </Label>
          <Input
            id="brand-name"
            value={name}
            onChange={event => setName(event.target.value)}
            maxLength={80}
            placeholder="Acme"
            autoComplete="off"
            autoFocus
            disabled={isPending}
            className="h-10 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand-description" className="text-xs font-medium text-foreground/56">
            Description
          </Label>
          <Textarea
            id="brand-description"
            value={description}
            onChange={event => setDescription(event.target.value)}
            maxLength={480}
            placeholder="Voice, audience, and what this brand stands for"
            disabled={isPending}
            className="min-h-20 rounded-md"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="brand-industry" className="text-xs font-medium text-foreground/56">
              Industry
            </Label>
            <Input
              id="brand-industry"
              value={industry}
              onChange={event => setIndustry(event.target.value)}
              maxLength={80}
              placeholder="Fashion, SaaS…"
              autoComplete="off"
              disabled={isPending}
              className="h-10 rounded-md"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand-website" className="text-xs font-medium text-foreground/56">
              Website
            </Label>
            <Input
              id="brand-website"
              type="text"
              inputMode="url"
              value={website}
              onChange={event => setWebsite(event.target.value)}
              placeholder="https://acme.com"
              autoComplete="off"
              disabled={isPending}
              className="h-10 rounded-md"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-foreground/56">Colors</Label>
          <div className="flex flex-wrap items-center gap-2">
            {colors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setColors(current => current.filter(item => item !== color))}
                disabled={isPending}
                className={cn(
                  'group relative size-8 overflow-hidden rounded-md ring-1 ring-foreground/10',
                  'transition-transform duration-150 ease-out active:scale-[0.98]',
                  'focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none',
                  'motion-reduce:active:scale-100',
                )}
                style={{ backgroundColor: color }}
                aria-label={`Remove ${color}`}
                title={color}
              >
                <span className="absolute inset-0 flex items-center justify-center bg-foreground/44 opacity-0 transition-opacity group-hover:opacity-100">
                  <XIcon className="size-3 text-background" strokeWidth={2} />
                </span>
              </button>
            ))}

            {colors.length < MAX_BRAND_COLORS ? (
              <div className="flex items-center gap-2">
                <label
                  className={cn(
                    'relative size-8 overflow-hidden rounded-md ring-1 ring-foreground/10',
                    isPending ? 'pointer-events-none opacity-50' : 'cursor-pointer',
                  )}
                  style={{ backgroundColor: draftColor }}
                >
                  <span className="sr-only">Pick a color</span>
                  <input
                    type="color"
                    value={draftColor}
                    disabled={isPending}
                    onChange={event => setDraftColor(event.target.value)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-md px-3 text-sm"
                  onClick={addColor}
                  disabled={isPending}
                >
                  <PlusIcon className="size-3.5" />
                  Add
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <DialogFooter className="shrink-0 border-t border-foreground/10 px-6 py-4">
        <Button
          type="button"
          variant="outline"
          className="rounded-md"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" className="rounded-md" disabled={!trimmedName || isPending}>
          {isPending ? <Loader2Icon className="size-4 animate-spin" /> : null}
          {isEdit ? 'Save' : 'Create brand'}
        </Button>
      </DialogFooter>
    </form>
  )
}
