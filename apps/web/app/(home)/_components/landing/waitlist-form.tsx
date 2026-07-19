'use client'

import { joinWaitlistAction } from '@/app/(home)/_actions/join-waitlist'
import { HERO, WAITLIST_FORM_ID } from '@/app/(home)/_components/landing/content'
import { IDLE_WAITLIST_STATE, type JoinWaitlistFormState } from '@/app/(home)/_lib/waitlist-form-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useActionState, useEffect, useId, useRef } from 'react'
import { useFormStatus } from 'react-dom'

type WaitlistFormProps = {
  className?: string
  size?: 'default' | 'compact'
  autoFocus?: boolean
  /** When true, parent provides the card chrome — no inner border/shadow on the input group. */
  inset?: boolean
}

function SubmitButton({ compact }: { compact?: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      size={compact ? 'default' : 'lg'}
      disabled={pending}
      className={cn(
        'shrink-0 font-medium',
        compact ? 'h-10 w-full px-4 sm:w-auto' : 'h-10 w-full px-5 sm:h-11 sm:w-auto',
      )}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {pending ? 'Joining…' : 'Join waitlist'}
    </Button>
  )
}

function StatusMessage({ state }: { state: JoinWaitlistFormState }) {
  if (state.status === 'idle' || !state.message) return null

  const isPositive = state.status === 'success' || state.status === 'duplicate'

  return (
    <p role="status" aria-live="polite" className={cn('text-sm leading-6', isPositive ? 'text-foreground' : 'text-destructive')}>
      {state.message}
    </p>
  )
}

export function WaitlistForm({ className, size = 'default', autoFocus = false, inset = false }: WaitlistFormProps) {
  const emailId = useId()
  const errorId = useId()
  const emailRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()
  const [state, formAction] = useActionState(joinWaitlistAction, IDLE_WAITLIST_STATE)

  useEffect(() => {
    if (!autoFocus) return
    const frame = requestAnimationFrame(() => emailRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [autoFocus])

  const utmSource = searchParams.get('utm_source') ?? ''
  const utmMedium = searchParams.get('utm_medium') ?? ''
  const utmCampaign = searchParams.get('utm_campaign') ?? ''
  const isDone = state.status === 'success' || state.status === 'duplicate'

  return (
    <div className={cn('w-full', className)}>
      {isDone ? (
        <div className="flex items-start gap-3 p-3 sm:p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" strokeWidth={1.75} />
          <div className="min-w-0">
            <p className="text-sm font-medium tracking-tight">You are on the list</p>
            <StatusMessage state={state} />
            {state.email ? (
              <p className="mt-1.5 text-sm text-muted-foreground">
                We will reach out at <span className="text-foreground">{state.email}</span>
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <form action={formAction} className="space-y-2.5 p-1" noValidate>
          <input type="hidden" name="source" value="landing" />
          <input type="hidden" name="utmSource" value={utmSource} />
          <input type="hidden" name="utmMedium" value={utmMedium} />
          <input type="hidden" name="utmCampaign" value={utmCampaign} />

          <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor={`${emailId}-website`}>Website</label>
            <input
              id={`${emailId}-website`}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>

          <div
            className={cn(
              'flex flex-col gap-2 rounded-lg p-1.5',
              !inset && 'border border-border bg-background shadow-sm',
              size === 'default' ? 'sm:flex-row sm:items-center' : '',
            )}
          >
            <div className="min-w-0 flex-1">
              <label htmlFor={emailId} className="sr-only">
                Email
              </label>
              <Input
                ref={emailRef}
                id={emailId}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                aria-invalid={Boolean(state.fieldErrors?.email)}
                aria-describedby={state.fieldErrors?.email || state.status === 'error' ? errorId : undefined}
                className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0 sm:h-11"
              />
            </div>
            <SubmitButton compact={size === 'compact'} />
          </div>

          {(state.fieldErrors?.email || state.status === 'error') && (
            <p id={errorId} role="alert" className="px-1 text-sm text-destructive">
              {state.fieldErrors?.email ?? state.message}
            </p>
          )}

          {size === 'default' ? (
            <p className="px-1 text-xs text-muted-foreground">{HERO.reassurance}</p>
          ) : null}
        </form>
      )}
    </div>
  )
}

export function WaitlistFormAnchor() {
  return <div id={WAITLIST_FORM_ID} className="scroll-mt-20" />
}
