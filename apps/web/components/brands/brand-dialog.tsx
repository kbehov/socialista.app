'use client'

import {
  DashboardSegment,
  DashboardSegmentButton,
} from '@/components/dashboard'
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
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { uploadToWorkspace } from '@/services/files.service'
import { createBrand, extractBrand, updateBrand } from '@/services/brand.service'
import { getProjectId, useProjectStore } from '@/store/project.store'
import { useWorkspaceStore } from '@/store/workspace.store'
import { getInitials } from '@/utils/user'
import {
  BRAND_COLORS_MAX,
  BRAND_DESCRIPTION_MAX,
  BRAND_INDUSTRY_MAX,
  BRAND_NAME_MAX,
  type Brand,
  type ExtractBrandResponse,
} from '@socialista/types'
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CameraIcon,
  Loader2Icon,
  PlusIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, useTransition, type FormEvent, type RefObject } from 'react'
import { toast } from 'sonner'

const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

type BrandDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  brand?: Brand | null
  onSaved?: () => void
}

type CreateTab = 'url' | 'manual'

type ExtractState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ExtractBrandResponse }
  | { status: 'error'; message: string }

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

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function BrandDialog({ open, onOpenChange, workspaceId, brand, onSaved }: BrandDialogProps) {
  const isEdit = Boolean(brand)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <BrandForm
          key={brand?._id ?? 'create'}
          workspaceId={workspaceId}
          brand={brand}
          onClose={() => onOpenChange(false)}
          onSaved={onSaved}
          isEdit={isEdit}
        />
      ) : null}
    </Dialog>
  )
}

function BrandForm({
  workspaceId,
  brand,
  onClose,
  onSaved,
  isEdit,
}: {
  workspaceId: string
  brand?: Brand | null
  onClose: () => void
  onSaved?: () => void
  isEdit: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const projectId = useProjectStore(s => getProjectId(s.currentProject))
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)

  const [tab, setTab] = useState<CreateTab>('url')
  const [sourceUrl, setSourceUrl] = useState(brand?.website ?? '')
  const [extractState, setExtractState] = useState<ExtractState>({ status: 'idle' })
  const [hasFetched, setHasFetched] = useState(false)

  const [name, setName] = useState(brand?.name ?? '')
  const [description, setDescription] = useState(brand?.description ?? '')
  const [industry, setIndustry] = useState(brand?.industry ?? '')
  const [website, setWebsite] = useState(brand?.website ?? '')
  const [savedLogoUrl] = useState(brand?.logo ?? '')
  const [extractedLogoUrl, setExtractedLogoUrl] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [colors, setColors] = useState<string[]>(brand?.colors ?? [])
  const [draftColor, setDraftColor] = useState('#0a84ff')
  const [isExtracting, startExtract] = useTransition()
  const [isSaving, startSave] = useTransition()

  const trimmedName = name.trim()
  const displayedLogo = logoPreview ?? (removeLogo ? '' : extractedLogoUrl || savedLogoUrl)
  const isBusy = isExtracting || isSaving || extractState.status === 'loading'
  const showIdentityFields = isEdit || tab === 'manual' || hasFetched
  const canSubmit = Boolean(trimmedName) && !isBusy && (isEdit || tab === 'manual' || hasFetched)

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
    setExtractedLogoUrl('')
    setRemoveLogo(false)
  }

  const clearLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoFile(null)
    setLogoPreview(null)
    setExtractedLogoUrl('')
    if (isEdit && savedLogoUrl) {
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
    if (colors.length >= BRAND_COLORS_MAX) {
      toast.error(`A brand can have at most ${BRAND_COLORS_MAX} colors`)
      return
    }
    setColors(current => [...current, hex])
  }

  const applyExtractedBrand = (data: ExtractBrandResponse) => {
    setName(data.name.slice(0, BRAND_NAME_MAX))
    setDescription(data.description.slice(0, BRAND_DESCRIPTION_MAX))
    setIndustry(data.industry.slice(0, BRAND_INDUSTRY_MAX))
    setWebsite(data.website)
    setColors(data.colors.slice(0, BRAND_COLORS_MAX))
    if (!logoFile) {
      setExtractedLogoUrl(data.logo ?? '')
      setRemoveLogo(false)
    }
  }

  const handleExtract = () => {
    const trimmed = sourceUrl.trim()
    if (!trimmed) {
      setExtractState({ status: 'error', message: 'Paste a website URL to continue.' })
      return
    }

    const normalized = normalizeWebsite(trimmed)
    if (!normalized) {
      setExtractState({ status: 'error', message: 'Enter a valid http or https URL.' })
      return
    }

    startExtract(async () => {
      setExtractState({ status: 'loading' })
      try {
        const response = await extractBrand(normalized)
        if (!response.success || !response.data?.name?.trim()) {
          setExtractState({
            status: 'error',
            message: response.message ?? 'Could not extract brand details from this URL.',
          })
          return
        }

        applyExtractedBrand(response.data)
        setHasFetched(true)
        setExtractState({ status: 'success', data: response.data })
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Could not extract brand details from this URL.'
        setExtractState({ status: 'error', message })
      }
    })
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
    if (!canSubmit) return

    const websiteValue = website.trim()
    const normalizedWebsite = websiteValue ? normalizeWebsite(websiteValue) : undefined
    if (websiteValue && !normalizedWebsite) {
      toast.error('Enter a valid website URL')
      return
    }

    startSave(async () => {
      try {
        const uploadedLogo = await uploadLogo()
        if (logoFile && !uploadedLogo) return

        const nextLogo = uploadedLogo ?? (removeLogo ? '' : extractedLogoUrl || undefined)

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
          logo: nextLogo || undefined,
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
    <DialogContent
      className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      showCloseButton={!isBusy}
    >
      <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
        <div className="shrink-0 space-y-4 border-b border-foreground/10 px-6 py-5 pr-12">
          <DialogHeader className="gap-1 text-left">
            <DialogTitle className="text-base font-medium tracking-[-0.02em]">
              {isEdit ? 'Edit brand' : 'New brand'}
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground/56">
              {isEdit
                ? 'Update the identity used as context for posts, skills, and studio tools.'
                : tab === 'url'
                  ? 'Paste a homepage URL and we’ll fill name, description, industry, and colors.'
                  : 'Name, logo, colors, and positioning used as context for AI tools.'}
            </DialogDescription>
          </DialogHeader>

          {!isEdit ? (
            <DashboardSegment label="How to add this brand" className="w-full">
              <DashboardSegmentButton
                active={tab === 'url'}
                disabled={isBusy}
                className="h-8 flex-1 justify-center"
                onClick={() => setTab('url')}
              >
                From website
              </DashboardSegmentButton>
              <DashboardSegmentButton
                active={tab === 'manual'}
                disabled={isBusy}
                className="h-8 flex-1 justify-center"
                onClick={() => setTab('manual')}
              >
                Manual
              </DashboardSegmentButton>
            </DashboardSegment>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          {!isEdit && tab === 'url' ? (
            <div className="space-y-2">
              <Label htmlFor="brand-source-url" className="text-xs font-medium text-foreground/56">
                Website
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="brand-source-url"
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  autoFocus
                  placeholder="https://acme.com"
                  value={sourceUrl}
                  disabled={isBusy}
                  className="h-10 min-w-0 flex-1 rounded-md"
                  onChange={event => {
                    setSourceUrl(event.target.value)
                    if (extractState.status === 'error') {
                      setExtractState({ status: 'idle' })
                    }
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleExtract()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 shrink-0 rounded-md px-4"
                  disabled={isBusy || !sourceUrl.trim()}
                  onClick={handleExtract}
                >
                  {isExtracting || extractState.status === 'loading' ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <>
                      Fetch
                      <ArrowRightIcon className="size-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : null}

          {!isEdit && tab === 'url' && extractState.status === 'error' ? (
            <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3">
              <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-destructive">Couldn&apos;t extract brand</p>
                <p className="mt-1 text-sm leading-relaxed text-destructive/80">{extractState.message}</p>
              </div>
            </div>
          ) : null}

          {!isEdit && tab === 'url' && !hasFetched && extractState.status !== 'error' ? (
            <div className="overflow-hidden rounded-md border border-foreground/10 bg-foreground/[0.02]">
              {extractState.status === 'loading' ? (
                <div className="flex min-h-[132px] flex-col items-start justify-center gap-3 px-5 py-6">
                  <Loader2Icon className="size-5 animate-spin text-foreground/44" />
                  <p className="text-sm text-foreground/56">Reading the website and drafting brand context…</p>
                </div>
              ) : (
                <div className="flex min-h-[132px] flex-col justify-center px-5 py-6">
                  <p className="text-sm font-medium text-foreground">Brand details will appear here</p>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-foreground/56">
                    Works with most company homepages. You can edit everything before saving.
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {!isEdit && tab === 'url' && extractState.status === 'success' ? (
            <p className="text-sm text-foreground/56">
              Filled from {getHostname(extractState.data.website)}. Review before creating.
            </p>
          ) : null}

          {showIdentityFields ? (
            <BrandIdentityFields
              name={name}
              description={description}
              industry={industry}
              website={website}
              colors={colors}
              draftColor={draftColor}
              displayedLogo={displayedLogo}
              trimmedName={trimmedName}
              isPending={isBusy}
              autoFocusName={isEdit || tab === 'manual'}
              fileInputRef={fileInputRef}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onIndustryChange={setIndustry}
              onWebsiteChange={setWebsite}
              onDraftColorChange={setDraftColor}
              onRemoveColor={color => setColors(current => current.filter(item => item !== color))}
              onAddColor={addColor}
              onChooseLogo={() => fileInputRef.current?.click()}
              onLogoFile={handleLogoFile}
              onClearLogo={clearLogo}
              hasLogo={Boolean(displayedLogo || logoFile)}
            />
          ) : null}
        </div>

        <DialogFooter className="shrink-0 border-t border-foreground/10 px-6 py-4">
          <Button type="button" variant="outline" className="rounded-md" onClick={onClose} disabled={isBusy}>
            Cancel
          </Button>
          <Button type="submit" className="rounded-md" disabled={!canSubmit}>
            {isSaving ? <Loader2Icon className="size-4 animate-spin" /> : null}
            {isEdit ? 'Save' : 'Create brand'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

function BrandIdentityFields({
  name,
  description,
  industry,
  website,
  colors,
  draftColor,
  displayedLogo,
  trimmedName,
  isPending,
  autoFocusName,
  fileInputRef,
  onNameChange,
  onDescriptionChange,
  onIndustryChange,
  onWebsiteChange,
  onDraftColorChange,
  onRemoveColor,
  onAddColor,
  onChooseLogo,
  onLogoFile,
  onClearLogo,
  hasLogo,
}: {
  name: string
  description: string
  industry: string
  website: string
  colors: string[]
  draftColor: string
  displayedLogo: string
  trimmedName: string
  isPending: boolean
  autoFocusName: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onIndustryChange: (value: string) => void
  onWebsiteChange: (value: string) => void
  onDraftColorChange: (value: string) => void
  onRemoveColor: (color: string) => void
  onAddColor: () => void
  onChooseLogo: () => void
  onLogoFile: (file: File) => void
  onClearLogo: () => void
  hasLogo: boolean
}) {
  return (
    <>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onChooseLogo}
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
            if (file) onLogoFile(file)
          }}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium tracking-[-0.01em]">Logo</p>
          <p className="mt-0.5 text-sm text-foreground/56">Optional. A square image works best.</p>
          {hasLogo ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-1 h-7 px-0 text-sm text-foreground/56 hover:text-foreground"
              onClick={onClearLogo}
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
          onChange={event => onNameChange(event.target.value)}
          maxLength={BRAND_NAME_MAX}
          placeholder="Acme"
          autoComplete="off"
          autoFocus={autoFocusName}
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
          onChange={event => onDescriptionChange(event.target.value)}
          maxLength={BRAND_DESCRIPTION_MAX}
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
            onChange={event => onIndustryChange(event.target.value)}
            maxLength={BRAND_INDUSTRY_MAX}
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
            onChange={event => onWebsiteChange(event.target.value)}
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
              onClick={() => onRemoveColor(color)}
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

          {colors.length < BRAND_COLORS_MAX ? (
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
                  onChange={event => onDraftColorChange(event.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-md px-3 text-sm"
                onClick={onAddColor}
                disabled={isPending}
              >
                <PlusIcon className="size-3.5" />
                Add
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
