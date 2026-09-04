'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type { UgcClip, UgcProject } from '@socialista/types'
import { UGC_SCRIPT_MAX_CHARS, ugcResolvedClipModels, ugcScriptTargetChars } from '@socialista/types'
import { Loader2Icon, SparklesIcon } from 'lucide-react'

type UgcScriptComposerProps = {
  project: UgcProject
  clip: UgcClip
  writing?: boolean
  onScriptChange: (text: string) => void
  onWriteWithAi: (modelValue?: string) => void
}

export function UgcScriptComposer({
  project,
  clip,
  writing,
  onScriptChange,
  onWriteWithAi,
}: UgcScriptComposerProps) {
  const scriptModels = useUgcProjectStore(s => s.scriptModels)
  const text = clip.script?.text ?? ''
  const target = ugcScriptTargetChars(clip.durationSec)
  const resolved = ugcResolvedClipModels(project, clip)
  const scriptModel = scriptModels.find(model => model.value === resolved.script) ?? scriptModels[0]

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-medium tracking-tight">What they say</p>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {text.length}/{UGC_SCRIPT_MAX_CHARS} · ~{target} chars
        </span>
      </div>
      <Textarea
        value={text}
        onChange={event => onScriptChange(event.target.value)}
        placeholder="One breath. Hook, proof, ask."
        className="min-h-28 text-[13px]"
        maxLength={UGC_SCRIPT_MAX_CHARS}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7"
        disabled={writing || !scriptModel}
        onClick={() => onWriteWithAi(scriptModel?.value)}
      >
        {writing ? <Loader2Icon className="size-3.5 animate-spin" /> : <SparklesIcon className="size-3.5" />}
        Write with AI
      </Button>
    </div>
  )
}
