'use client'

import { dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { UGC_SCRIPT_MAX_CHARS } from '@socialista/types'
import { Loader2Icon, SparklesIcon } from 'lucide-react'
import { useState } from 'react'

type UgcScriptPanelProps = {
  script: string
  disabled?: boolean
  writing?: boolean
  scriptModelEnabled?: boolean
  onScriptChange: (value: string) => void
  onWriteWithAi: () => void
}

export function UgcScriptPanel({
  script,
  disabled,
  writing,
  scriptModelEnabled,
  onScriptChange,
  onWriteWithAi,
}: UgcScriptPanelProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const count = script.length

  const requestWrite = () => {
    if (script.trim()) {
      setConfirmOpen(true)
      return
    }
    onWriteWithAi()
  }

  return (
    <section className={dashboardSurface.section}>
      <div className={cn(dashboardSurface.sectionHeader, 'flex items-center justify-between gap-3 px-4 py-3')}>
        <div>
          <h2 className={dashboardSurface.sectionTitle}>Script</h2>
          <p className={dashboardSurface.sectionDescription}>What they say. Max {UGC_SCRIPT_MAX_CHARS} characters.</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || writing || !scriptModelEnabled}
          onClick={requestWrite}
        >
          {writing ? <Loader2Icon className="size-3.5 animate-spin" /> : <SparklesIcon className="size-3.5" />}
          Write with AI
        </Button>
      </div>

      <div className="space-y-3 p-4">
        <Textarea
          value={script}
          disabled={disabled || writing}
          maxLength={UGC_SCRIPT_MAX_CHARS}
          onChange={event => onScriptChange(event.target.value.slice(0, UGC_SCRIPT_MAX_CHARS))}
          placeholder="What should they say?"
          className="min-h-24 resize-y"
        />
        <p className="text-right text-[11px] tabular-nums text-muted-foreground">
          {count}/{UGC_SCRIPT_MAX_CHARS}
        </p>

        {confirmOpen ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
            <p className="text-[12px] text-muted-foreground">Replace the script you typed?</p>
            <div className="flex gap-1.5">
              <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmOpen(false)}>
                Keep
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setConfirmOpen(false)
                  onWriteWithAi()
                }}
              >
                Replace
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
