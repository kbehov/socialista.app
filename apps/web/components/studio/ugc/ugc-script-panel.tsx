'use client'

import { dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ChevronDownIcon, Loader2Icon, SparklesIcon } from 'lucide-react'
import { useState } from 'react'

type UgcScriptPanelProps = {
  script: string
  directions?: string
  disabled?: boolean
  writing?: boolean
  scriptModelEnabled?: boolean
  onScriptChange: (value: string) => void
  onDirectionsChange: (value: string) => void
  onWriteWithAi: () => void
}

export function UgcScriptPanel({
  script,
  directions,
  disabled,
  writing,
  scriptModelEnabled,
  onScriptChange,
  onDirectionsChange,
  onWriteWithAi,
}: UgcScriptPanelProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [directionsOpen, setDirectionsOpen] = useState(Boolean(directions))

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
          <p className={dashboardSurface.sectionDescription}>What should they say?</p>
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
          onChange={event => onScriptChange(event.target.value)}
          placeholder="What should they say?"
          className="min-h-28 resize-y"
        />

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

        <Collapsible open={directionsOpen} onOpenChange={setDirectionsOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground">
            Directions
            <ChevronDownIcon className={cn('size-3.5 transition-transform', directionsOpen && 'rotate-180')} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <Textarea
              value={directions ?? ''}
              disabled={disabled}
              onChange={event => onDirectionsChange(event.target.value)}
              placeholder="handheld, kitchen, she unscrews the cap"
              className="min-h-16"
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  )
}
