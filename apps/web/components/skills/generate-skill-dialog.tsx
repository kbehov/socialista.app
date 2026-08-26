'use client'

import { generateSkillAction } from '@/actions/skill.actions'
import { SkillModelSelector } from '@/components/skills/skill-model-selector'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { getWorkspaceBrands } from '@/services/brand.service'
import { getModels } from '@/services/models.service'
import { getProjectId, useProjectStore } from '@/store/project.store'
import { getWorkspaceId, useWorkspaceStore } from '@/store/workspace.store'
import {
  ModelType,
  PROMPT_KEY_LABELS,
  PROMPT_KEY_VALUES,
  type Brand,
  type Model,
  type PromptKey,
} from '@socialista/types'
import { Loader2Icon, SparklesIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

const AUTO_TARGET = 'auto'
const NONE_BRAND = 'none'
const TEXT_MODELS_QUERY = `limit=50&modelType=${ModelType.TEXT}&sort=-usageCount`

type GenerateSkillDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GenerateSkillDialog({ open, onOpenChange }: GenerateSkillDialogProps) {
  const router = useRouter()
  const workspaceId = useWorkspaceStore(s => getWorkspaceId(s.currentWorkspace))
  const projectId = useProjectStore(s => getProjectId(s.currentProject))
  const [description, setDescription] = useState('')
  const [target, setTarget] = useState<string>(AUTO_TARGET)
  const [brandId, setBrandId] = useState(NONE_BRAND)
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [selectedModelId, setSelectedModelId] = useState('')
  const [hasLoadedModels, setHasLoadedModels] = useState(false)
  const [hasLoadedBrands, setHasLoadedBrands] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return

    let cancelled = false

    void getModels(TEXT_MODELS_QUERY)
      .then(response => {
        if (cancelled) return
        const next = (response.data?.models ?? []).filter(model => model.modelType === ModelType.TEXT)
        setModels(next)
        setSelectedModelId(current =>
          current && next.some(model => model._id === current) ? current : (next[0]?._id ?? ''),
        )
      })
      .catch(() => {
        if (cancelled) return
        setModels([])
        setSelectedModelId('')
        toast.error('Could not load text models.')
      })
      .finally(() => {
        if (!cancelled) setHasLoadedModels(true)
      })

    if (!workspaceId) {
      return () => {
        cancelled = true
      }
    }

    void getWorkspaceBrands(workspaceId, { projectId, limit: 50 })
      .then(response => {
        if (cancelled) return
        const next = response.data?.brands ?? []
        setBrands(next)
        setBrandId(current =>
          current === NONE_BRAND || next.some(brand => brand._id === current) ? current : NONE_BRAND,
        )
      })
      .catch(() => {
        if (cancelled) return
        setBrands([])
        toast.error('Could not load brands.')
      })
      .finally(() => {
        if (!cancelled) setHasLoadedBrands(true)
      })

    return () => {
      cancelled = true
    }
  }, [open, workspaceId, projectId])

  const resetForm = () => {
    setDescription('')
    setTarget(AUTO_TARGET)
    setBrandId(NONE_BRAND)
  }

  const handleOpenChange = (next: boolean) => {
    if (isPending) return
    if (!next) resetForm()
    onOpenChange(next)
  }

  const selectedModel = models.find(model => model._id === selectedModelId) ?? models[0]
  const hasBrands = brands.length > 0

  const handleGenerate = () => {
    const trimmed = description.trim()
    if (!trimmed || isPending || !selectedModel) return

    const pinnedTarget = target !== AUTO_TARGET ? (target as PromptKey) : undefined
    const selectedBrandId = brandId !== NONE_BRAND ? brandId : undefined

    startTransition(async () => {
      const result = await generateSkillAction({
        description: trimmed,
        target: pinnedTarget,
        model: selectedModel.value,
        brandId: selectedBrandId,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success('Skill created')
      resetForm()
      onOpenChange(false)
      router.push(DASHBOARD_ROUTES.editSkill(result.skill._id))
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SparklesIcon className="size-4 text-primary" />
            Generate skill with AI
          </DialogTitle>
          <DialogDescription>
            Describe the skill you want. It is saved to your library, then opened so you can edit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="generate-skill-description" className="text-xs font-medium">
              Description
            </Label>
            <Textarea
              id="generate-skill-description"
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="Luxury product stills for jewelry: quiet editorial lighting, one hero SKU, no lifestyle clutter."
              rows={5}
              disabled={isPending}
              className="min-h-28 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="generate-skill-brand" className="text-xs font-medium">
              Brand
            </Label>
            <Select
              value={brandId}
              onValueChange={setBrandId}
              disabled={isPending || !hasBrands}
            >
              <SelectTrigger id="generate-skill-brand" className="w-full">
                <SelectValue placeholder={hasLoadedBrands ? 'None' : 'Loading brands…'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_BRAND}>None</SelectItem>
                {brands.map(brand => (
                  <SelectItem key={brand._id} value={brand._id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {!hasLoadedBrands ? (
                'Optional. Attach a brand so the generator can lock its identity into the skill.'
              ) : hasBrands ? (
                'Optional. The generator will lock this brand identity into the skill.'
              ) : (
                <>
                  Add a brand in{' '}
                  <Link href={DASHBOARD_ROUTES.BRANDS} className="underline underline-offset-2">
                    Context → Brands
                  </Link>{' '}
                  to use it here.
                </>
              )}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="generate-skill-model" className="text-xs font-medium">
              Model
            </Label>
            <SkillModelSelector
              id="generate-skill-model"
              models={models}
              selectedModelId={selectedModel?._id ?? ''}
              onSelectedModelChange={setSelectedModelId}
              loading={!hasLoadedModels}
              disabled={isPending}
            />
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Text model used to write the skill instructions.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="generate-skill-target" className="text-xs font-medium">
              Overrides
            </Label>
            <Select value={target} onValueChange={setTarget} disabled={isPending}>
              <SelectTrigger id="generate-skill-target" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AUTO_TARGET}>Auto (infer from description)</SelectItem>
                {PROMPT_KEY_VALUES.map(key => (
                  <SelectItem key={key} value={key}>
                    {PROMPT_KEY_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Which generation tool this skill will replace when you attach it.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isPending || !description.trim() || !selectedModel}
            onClick={handleGenerate}
          >
            {isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : <SparklesIcon className="size-3.5" />}
            {isPending ? 'Generating…' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
