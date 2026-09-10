'use client'

import { submitFeedbackAction } from '@/actions/feedback.actions'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { FEEDBACK_MESSAGE_MAX_LENGTH } from '@socialista/types'
import { Loader2Icon } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export function FeedbackButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const canSend = message.trim().length > 0 && !isPending

  const send = () => {
    if (!canSend) return

    startTransition(async () => {
      const result = await submitFeedbackAction(message)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      setMessage('')
      setOpen(false)
      toast.success('Thanks — we got your feedback')
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          Feedback
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-72 gap-3 p-3">
        <PopoverHeader>
          <PopoverTitle>Feedback</PopoverTitle>
          <PopoverDescription>Tell us what’s working, or what isn’t.</PopoverDescription>
        </PopoverHeader>
        <form
          className="flex flex-col gap-2.5"
          onSubmit={event => {
            event.preventDefault()
            send()
          }}
        >
          <Textarea
            value={message}
            onChange={event => setMessage(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                send()
              }
            }}
            maxLength={FEEDBACK_MESSAGE_MAX_LENGTH}
            placeholder="A sentence is enough"
            disabled={isPending}
            rows={3}
            className="min-h-20 resize-none"
          />
          <Button type="submit" size="sm" disabled={!canSend} className="self-end">
            {isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
            Send
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
