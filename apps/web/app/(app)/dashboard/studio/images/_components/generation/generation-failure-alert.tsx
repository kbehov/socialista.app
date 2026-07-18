import { Button } from '@/components/ui/button'
import { AlertCircleIcon } from 'lucide-react'
import Link from 'next/link'

type GenerationFailureAlertProps = {
  message: string
  retryHref: string
  retryLabel: string
}

export function GenerationFailureAlert({ message, retryHref, retryLabel }: GenerationFailureAlertProps) {
  return (
    <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium text-destructive">Generation failed</p>
            <p className="mt-1 text-sm leading-relaxed text-destructive/80">{message}</p>
          </div>
          <Button asChild className="h-8 text-xs" size="sm" variant="outline">
            <Link href={retryHref}>{retryLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function GenerationMissingOutputAlert() {
  return (
    <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
        <p className="text-sm text-destructive">The run completed but no image was returned.</p>
      </div>
    </div>
  )
}
