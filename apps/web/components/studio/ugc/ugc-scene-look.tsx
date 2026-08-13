'use client'

import { dashboardSurface } from '@/components/dashboard'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type UgcSceneLookProps = {
  value?: string
  disabled?: boolean
  onChange: (value: string) => void
}

export function UgcSceneLook({ value, disabled, onChange }: UgcSceneLookProps) {
  return (
    <section className={dashboardSurface.section}>
      <div className={cn(dashboardSurface.sectionHeader, 'px-4 py-3')}>
        <h2 className={dashboardSurface.sectionTitle}>Scene look</h2>
        <p className={dashboardSurface.sectionDescription}>Optional. How the still should look for the image model.</p>
      </div>
      <div className="p-4">
        <Textarea
          value={value ?? ''}
          disabled={disabled}
          onChange={event => onChange(event.target.value)}
          placeholder="Morning kitchen, bottle close to camera, handheld phone UGC"
          className="min-h-16"
        />
      </div>
    </section>
  )
}
