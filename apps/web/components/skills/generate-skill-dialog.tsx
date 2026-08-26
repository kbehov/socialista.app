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
import { getModels } from '@/services/models.service'
import { ModelType, PROMPT_KEY_LABELS, PROMPT_KEY_VALUES, type Model, type PromptKey } from '@socialista/types'
import { Loader2Icon, SparklesIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

const AUTO_TARGET = 'auto'
const TEXT_MODELS_QUERY = `limit=50&modelType=${ModelType.TEXT}&sort=-usageCount`

type GenerateSkillDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GenerateSkillDialog({ open, onOpenChange }: GenerateSkillDialogProps) {
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [target, setTarget] = useState<string>(AUTO_TARGET)
  const [models, setModels] = useState<Model[]>([])
  const [selectedModelId, setSelectedModelId] = useState('')
  const [hasLoadedModels, setHasLoadedModels] = useState(false)
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

    return () => {
      cancelled = true
    }
  }, [open])

  const handleOpenChange = (next: boolean) => {
    if (isPending) return
    if (!next) {
      setDescription('')
      setTarget(AUTO_TARGET)
    }
    onOpenChange(next)
  }

  const selectedModel = models.find(model => model._id === selectedModelId) ?? models[0]

  const handleGenerate = () => {
    const trimmed = description.trim()
    if (!trimmed || isPending || !selectedModel) return

    const pinnedTarget = target !== AUTO_TARGET ? (target as PromptKey) : undefined

    startTransition(async () => {
      const result = await generateSkillAction(trimmed, pinnedTarget, selectedModel.value)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success('Skill created')
      setDescription('')
      setTarget(AUTO_TARGET)
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
